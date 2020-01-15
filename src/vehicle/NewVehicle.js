import React, { Component } from 'react';
import { createVehicle } from '../util/APIUtils';
import './NewVehicle.css';  
import { Form, Input, Button, Select, Col, notification } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;

class NewVehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: {
                text: ''
            },
            types: [],
            type: {
                text: ''
            },
            chassisSeries: {
                text: ''
            },
            chassisNumber: {
                text: ''
            }
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleChassisNumberChange = this.handleChassisNumberChange.bind(this);
        this.handleChassisSeriesChange = this.handleChassisSeriesChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }

    componentDidMount() {
        this.setState({
            types: [
                {id: 'Bus', name: 'Bus'},
                {id: 'Car', name: 'Car'},
                {id: 'Truck', name: 'Truck'}
            ]
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const vehicleData = {
            color: this.state.color.text,
            type: this.state.type.text,
            chassisSeries: this.state.chassisSeries.text,
            chassisNumber: this.state.chassisNumber.text
        };

        createVehicle(vehicleData)
        .then(response => {
            this.props.history.push("/");
        }).catch(error => {
            if(error.status === 401) {
                this.this.state.handleLogout('/login', 'error', 'You have been logged out. Please login to create vehicle.');    
            } else {
                notification.error({
                    message: 'Volvo',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
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
    
    validateChassisNumber = (chassisNumberText) => {
        if(chassisNumberText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: "Please enter the vehicle chassis number!"
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleChassisNumberChange(event) {
        const value = event.target.value;
        this.setState({
            chassisNumber: {
                text: value,
                ...this.validateChassisNumber(value)
            }
        });
    }
    
    validateChassisSeries = (chassisSeriesText) => {
        if(chassisSeriesText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: "Please enter your vehicle chassis series!"
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleChassisSeriesChange(event) {
        const value = event.target.value;
        this.setState({
            chassisSeries: {
                text: value,
                ...this.validateChassisSeries(value)
            }
        });
    }
    
    validateType = (typeText) => {
        if(typeText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: "Please select your vehicle's type!"
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleTypeChange(value) {
        const vehicleLength = Object.assign(this.state.type, {text: value});
        this.setState({
            vehicleLength: vehicleLength
        });
    }

    isFormInvalid() {
        if(this.state.color.validateStatus !== 'success'
            && this.state.type.validateStatus !== 'success'
            && this.state.chassisSeries.validateStatus !== 'success'
            && this.state.chassisNumber.validateStatus !== 'success') {
            return true;
        }
    }

    render() {
        const { types } = this.state;

        let typesList = types.length > 0
            && types.map((item, i) => {
            return (
                <Option key={i} value={item.id}>{item.name}</Option>
            )
        }, this);

        return (
            <div className="new-vehicle-container">
                <h1 className="page-title">Create Vehicle</h1>
                <div className="new-vehicle-content">
                    <Form onSubmit={this.handleSubmit} className="create-vehicle-form">
                        <FormItem validateStatus={this.state.color.validateStatus}
                            help={this.state.color.errorMsg} className="vehicle-form-row">
                            <Input 
                                placeholder = {'Color'}
                                size="large"
                                value={this.state.color.text} 
                                onChange={(event) => this.handleColorChange(event)} />    
                        </FormItem>
                        <FormItem validateStatus={this.state.chassisNumber.validateStatus}
                            help={this.state.chassisNumber.errorMsg} className="vehicle-form-row">
                            <Input 
                                placeholder = {"Chassis Number"}
                                size="large"
                                value={this.state.chassisNumber.text} 
                                onChange={(event) => this.handleChassisNumberChange(event)} />    
                        </FormItem>
                        <FormItem validateStatus={this.state.chassisSeries.validateStatus}
                            help={this.state.chassisSeries.errorMsg} className="vehicle-form-row">
                            <Input 
                                placeholder = {"Chassi's Series"}
                                size="large"
                                value={this.state.chassisSeries.text} 
                                onChange={(event) => this.handleChassisSeriesChange(event)} />    
                        </FormItem>
                        <FormItem className="vehicle-form-row">
                            <Col xs={24} sm={4}>
                                Vehicle type: 
                            </Col>
                            <Col xs={24} sm={20}>    
                                <span style = {{ marginRight: '18px' }}>
                                    <Select 
                                        onChange={this.handleTypeChange}
                                        value={this.state.type.text}>
                                        { typesList }
                                    </Select>
                                </span>
                            </Col>
                        </FormItem>
                        <FormItem className="vehicle-form-row">
                            <Button type="primary" 
                                htmlType="submit" 
                                size="large" 
                                disabled={this.isFormInvalid()}
                                className="create-vehicle-form-button">Create Vehicle</Button>
                        </FormItem>
                    </Form>
                </div>    
            </div>
        );
    }
}

export default NewVehicle;