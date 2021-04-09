import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import * as firebase from 'firebase';
import AlertContainer from 'react-alert';


class AddProduct extends Component {

  constructor(props) {
    super(props);
    this.defaultState = {
      productType: this.props.productType || 'rice',
      productKey: this.props.productKey || '',
      name: this.props.name || '',
      master_weight: this.props.master_weight || '',
      description: this.props.description || '',
      available: this.props.available,
      priority: this.props.priority || 0
    };
    this.state = {
      ...this.defaultState
    };
    this.alertOptions = {
      offset: 20,
      position: 'top right',
      theme: 'light',
      time: 5000,
      transition: 'fade'
    };
  }

  saveProduct() {
    const productType = this.state.productType;
    const productTypeRefPath = `products/${productType}`;
    const productTypeRef = firebase.database().ref().child(productTypeRefPath);
    const newProductData = {
      'name': this.state.name,
      'master_weight': this.state.master_weight,
      'description': this.state.description || '',
      'available': this.state.available,
      'priority': this.state.priority
    };
    productTypeRef.child(this.state.productKey).set(newProductData, error => {
      if(error) {
        this.msg.error(<div className="error">Error while Saving <h4>{ this.state.productKey }</h4>: { error.message }</div>, {
          time: 2000,
          type: 'error',
        });
      } else {
        this.msg.success( <div className="success"><h4>{ this.state.productKey }</h4> is Successfully Saved</div>, {
          time: 2000,
          type: 'success',
        });
      }

      if(this.props.mode === 'edit') {
        this.props.onClose();
      } else {
        this.setState({
            ...this.defaultState
        });
      }
    });
  }


  updateInputValue(field, event) {
    console.log(field + " changed to " + event.target.value);
    this.setState({
      [field]: event.target.value
    });
  }

  updateCheckBoxValue(field, event) {
    console.log(field + " checked with " + event.target.checked);
    this.setState({
      [field]: event.target.checked ? 'true' : 'false'
    });
  }

  render() {

    let buttonText =  'ADD PRODUCT';
    let opts = {};
    if(this.props.mode === 'edit'){
      buttonText = 'SAVE PRODUCT';
      opts['disabled'] = 'disabled';
    }

    return (
      <div className="add-product">
      <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />

        <ul>
          <li>
            <label>Product Type</label>
            <span>
              <select value={ this.state.productType }
                onChange={this.updateInputValue.bind(this,'productType')}
                { ...opts }>
                <option value="rice">Wheat</option>
                <option value="ravva">Paddy</option>
                <option value="broken">BROKEN</option>
              </select>
            </span>
          </li>
          <li>
            <label>Product Key</label>
            <span>
              <input type="text"
                name="productKey"
                placeholder="unique key to identify product"
                value={ this.state.productKey }
                onChange={ this.updateInputValue.bind(this,'productKey')}
                required { ...opts }>
              </input>
            </span>
          </li>

          <li>
            <label>Name</label>
            <span>
              <input type="text"
                name="name"
                placeholder="name of the product"
                value={ this.state.name }
                onChange={ this.updateInputValue.bind(this,'name') }
                required>
              </input>
            </span>
          </li>
          <li>
            <label>Master Weight</label>
            <span>
              <input type="text"
                name="master_weight"
                placeholder="master package weight in KGs"
                value={ this.state.master_weight }
                onChange={ this.updateInputValue.bind(this, 'master_weight') }
                required>
              </input>
            </span>
          </li>
          <li>
            <label>Available?</label>
            <span>
              <input type="checkbox"
                name="available"
                checked={ this.state.available === 'true' }
                onChange={ this.updateCheckBoxValue.bind(this, 'available') }>
              </input>
            </span>
          </li>
          <li>
            <label>Description</label>
            <span>
              <textarea name="description"
                placeholder="small write up about the product"
                value={ this.state.description }
                onChange={ this.updateInputValue.bind(this,'description') }>
              </textarea>
            </span>
          </li>
          <li>
            <label>Priority</label>
            <span>
              <input type="text"
                name="priority"
                placeholder="lower number shows first in app"
                value={ this.state.priority }
                onChange={ this.updateInputValue.bind(this, 'priority') }>
              </input>
            </span>
          </li>
          <li>
            <Button className="save-button" bsStyle="primary" onClick={ this.saveProduct.bind(this) } disabled={ !(this.state.productKey && this.state.name && this.state.master_weight) }>ADD PRODUCT</Button>
          </li>
        </ul>

      </div>
    );
  }
}

export default AddProduct;
