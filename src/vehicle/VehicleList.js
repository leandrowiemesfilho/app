import React, { Component } from 'react';
import { getAllVehicles, getUserCreatedVehicles, searchVehicleByChassis, deleteVehicleByChassis, checkChassisExistence, editVehicleByChassis } from '../util/APIUtils';
import Vehicle from './Vehicle';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, Menu, Dropdown, Form, Input, Modal, notification } from 'antd';
import { VEHICLE_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './VehicleList.css';
const FormItem = Form.Item;

class VehicleList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vehicles: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            isLoading: false,
            visible: false,
            chassis: {
                text: ''
            },
            color: {
                text: ''
            },
            canEdit: false,
            view: false
        };
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadVehicleList = this.loadVehicleList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
        this.handleChassisChange = this.handleChassisChange.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.validateChassisExistence = this.validateChassisExistence.bind(this);
    }

    isFormInvalid() {
        if(this.state.chassis.validateStatus !== 'success'
            || this.state.color.validateStatus !== 'success'){
            return true;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const vehicleData = {
            color: this.state.color.text,
            chassisSeries: this.state.chassis.text,
        };

        editVehicleByChassis(vehicleData)
        .then(response => {
            notification.success({
                message: 'Volvo',
                description: "Vehicle updated!",
            });
            this.setState({
                visible: false
            })
            window.location.reload(false);
        }).catch(error => {
            if(error.status === 401) {
                this.state.handleLogout('/login', 'error', 'You have been logged out. Please login to create vehicle.');    
            } else {
                notification.error({
                    message: 'Volvo',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });
    }

    validateChassisExistence(event) {
        const chassisValue = event.target.value;
        const chassisValidation = this.validateChassis(chassisValue);

        if(chassisValidation.validateStatus === 'error') {
            this.setState({
                chassis: {
                    value: chassisValue,
                    ...chassisValidation
                }
            });
            return;
        }

        this.setState({
            chassis: {
                value: chassisValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });

        checkChassisExistence(chassisValue)
        .then(response => {
            if(response.exists) {
                this.setState({
                    chassis: {
                        value: chassisValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            } else {
                this.setState({
                    chassis: {
                        value: chassisValue,
                        validateStatus: 'error',
                        errorMsg: 'Chassis does not exists'
                    }
                });
            }
        }).catch(error => {
            this.setState({
                chassis: {
                    value: chassisValue,
                    validateStatus: 'success',
                    errorMsg: null
                }
            });
        });
    }

    validateChassis = (chassisText) => {
        if(chassisText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: "Please enter your vehicle chassis!"
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleChassisChange(event) {
        const value = event.target.value;
        this.setState({
            chassis: {
                text: value,
                ...this.validateChassis(value)
            }
        });
    }
    
    validateColor = (colorText) => {
        if(colorText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: "Please enter your vehicle color!"
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleColorChange(event) {
        const value = event.target.value;
        this.setState({
            color: {
                text: value,
                ...this.validateColor(value)
            }
        });
    }

    loadVehicleList(page = 0, size = VEHICLE_LIST_SIZE) {
        let promise;
        if(this.props.username) {
            if(this.props.type === 'USER_CREATED_VEHICLES') {
                promise = getUserCreatedVehicles(this.props.username, page, size);
            }
        } else {
            promise = getAllVehicles(page, size);
        }

        if(!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise            
        .then(response => {
            const vehicles = this.state.vehicles.slice();

            this.setState({
                vehicles: vehicles.concat(response.content),
                page: response.page,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                last: response.last,
                isLoading: false
            })
        }).catch(error => {
            this.setState({
                isLoading: false
            })
        });  
        
    }

    componentDidMount() {
        this.loadVehicleList();
    }

    componentDidUpdate(nextProps) {
        if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
            this.setState({
                vehicles: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                isLoading: false
            });    
            this.loadVehicleList();
        }
    }

    handleLoadMore() {
        this.loadVehicleList(this.state.page + 1);
    }

    showModal = () => {
        this.setState({
          visible: true,
        });
      };
    
      handleOk = e => {
        console.log(e);
        this.setState({
          visible: false,
        });
      };
    
      handleCancel = e => {
        console.log(e);
        this.setState({
          visible: false,
        });
      };

      handleMenuClick(e, chassis) {
        checkChassisExistence(chassis)
        .then(resp => {
            if(resp.exists){
                if(e.key === "search"){
                    this.setState({
                        canEdit: false,
                        view: true
                    });
                    searchVehicleByChassis(chassis);
                } else if (e.key === "edit"){
                    this.setState({
                        canEdit: true,
                        color: resp.color,
                        view: false
                    });
                } else if (e.key === "delete"){
                    if(window.confirm('Are you sure you wish to delete this vehicle?')) {
                        this.setState({
                            canEdit: false,
                            view: false
                        });
                        deleteVehicleByChassis(chassis)
                            .then(response => {
                                notification.success({
                                    message: 'Volvo',
                                    description: "Vehicle deleted!",
                                });
                                this.setState({
                                    visible: false
                                })
                                window.location.reload(false);
                            });

                    }
                }
            }else{
                this.setState({
                    chassis: {
                        value: chassis,
                        validateStatus: 'error',
                        errorMsg: 'Chassis does not exists'
                    }
                });
            }
        }).catch(error => {
            if(error.status === 401) {
                this.state.handleLogout('/login', 'error', 'You have been logged out. Please login to create vehicle.');    
            } else {
                notification.error({
                    message: 'Volvo',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        }); 
      }
      
    render() {
        const vehicleViews = [];
        this.state.vehicles.forEach((vehicle, vehicleIndex) => {
            vehicleViews.push(<Vehicle 
                key={vehicle.id} 
                vehicle={vehicle}
                />
            )            
        });

        const menu = (
            <Menu onClick={(event) => this.handleMenuClick(event, this.state.chassis.text)}>
                <Menu.Item key="edit">Edit</Menu.Item>
                <Menu.Item key="search">Search</Menu.Item>
                <Menu.Item key="delete">Delete</Menu.Item>
            </Menu>
        );

        return (
            <div className="vehicles-container">
                <div className="vehicle-actions">
                    <Button type="primary" onClick={this.showModal}>
                        Actions by chassis
                    </Button>
                </div>

                <Modal
                    title="Vehicle actions"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                          Cancel
                        </Button>,
                        <Dropdown overlay={menu}>
                            <Button>
                                Actions <Icon type="down" />
                            </Button>
                        </Dropdown>,
                        
                      ]}
                    >
                    <Form onSubmit={this.handleSubmit} className="create-vehicle-form">
                        <p>Type your vehicle chassis and select the action you want</p>
                        <FormItem validateStatus={this.state.chassis.validateStatus}
                            help={this.state.chassis.errorMsg} className="vehicle-form-row">
                            <Input 
                                placeholder = {'Chassis'}
                                size="large"
                                value={this.state.chassis.text} 
                                
                                onChange={(event) => this.handleChassisChange(event)} />    
                        </FormItem>
                        {
                            this.state.canEdit ? (
                                <div>
                                    <FormItem validateStatus={this.state.color.validateStatus}
                                        help={this.state.color.errorMsg} className="vehicle-form-row">
                                        <Input 
                                            placeholder = {'Color'}
                                            size="large"
                                            value={this.state.color.text} 
                                            onChange={(event) => this.handleColorChange(event)} />    
                                    </FormItem> 
                                    <FormItem className="vehicle-form-row">
                                        <Button type="primary" 
                                            htmlType="submit" 
                                            size="large" 
                                            disabled={this.isFormInvalid()}
                                            className="create-vehicle-form-button">Update Vehicle</Button>
                                    </FormItem>
                                </div>
                            ): null   
                        }
                        {
                            this.state.view ? (
                                <div>
                                    <FormItem className="vehicle-form-row">
                                        <Input 
                                            placeholder = {'Type'}
                                            size="large"
                                            value={this.state.color.text} 
                                            disabled
                                        />    
                                    </FormItem> 
                                    <FormItem className="vehicle-form-row">
                                        <Input 
                                            placeholder = {'Color'}
                                            size="large"
                                            value={this.state.color.text} 
                                            disabled
                                        />    
                                    </FormItem> 
                                    <FormItem className="vehicle-form-row">
                                        <Input 
                                            placeholder = {'Chassis serries'}
                                            size="large"
                                            value={this.state.color.text} 
                                            disabled
                                        />    
                                    </FormItem> 
                                    <FormItem className="vehicle-form-row">
                                        <Input 
                                            placeholder = {'Passengers'}
                                            size="large"
                                            value={this.state.color.text} 
                                            disabled
                                        />    
                                    </FormItem> 
                                </div>
                            ): null   
                        }
                    </Form>
                </Modal>

                {vehicleViews}
                {
                    !this.state.isLoading && this.state.vehicles.length === 0 ? (
                        <div className="no-vehicles-found">
                            <span>No vehicles found. Maybe you are dicconected.</span>
                        </div>    
                    ): null
                }  
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-vehicles"> 
                            <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                <Icon type="plus" /> Load more
                            </Button>
                        </div>): null
                }              
                {
                    this.state.isLoading ? 
                    <LoadingIndicator />: null                     
                }
            </div>
        );
    }
}

export default withRouter(VehicleList);