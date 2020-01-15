import React, { Component } from 'react';
import './Vehicle.css';

class Vehicle extends Component {
    render() {
        return (
            <div className="vehicle-content">
                <div className="vehicle-header">
                    <div className="vehicle-body">
                        {this.props.vehicle.chassisSeries}
                    </div>
                </div>
                <div className="vehicle-footer">
                    <span className="vehicle-type">{this.props.vehicle.type}</span>
                    <span className="separator">•</span>
                    <span className="vehicle-color">{ this.props.vehicle.color }</span>
                    <span className="separator">•</span>
                    <span className="vehicle-color">{ this.props.vehicle.passengers } passengers</span>
                </div>
            </div>
        );
    }
}

export default Vehicle;