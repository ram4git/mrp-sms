import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router';
import { Button, Form, Message, Divider, Dropdown } from 'semantic-ui-react'
import * as firebase from 'firebase';




class CreateUser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      areaOptions: []
    };
  }

  componentDidMount() {
    const areasRef = firebase.database().ref().child('areas');
    areasRef.once('value', snap => {
      const areas = snap.val();
      const areaOptions = [];
      Object.keys(areas).forEach( areaId => {
        areaOptions.push({
          key: areaId,
          text: areaId,
          value: areaId
        });
      });

      this.setState({
        areaOptions
      });
    });
  }

  render() {
    const arePasswordsEqual = (this.state.password === this.state.confirmPassword);

    return (
      <Form className="createUser" as="div" success error warning>
        { this.renderValidationMessage() }
        <Form.Group unstackable widths={3}>
          <Form.Input label='Name' placeholder='Name' width={6} onChange={ this.updateInputValue.bind(this,'name') } required error={!this.state.name}/>
          <Form.Input label='Shop Name' placeholder='Shop Name'width={6} onChange={ this.updateInputValue.bind(this,'shopName') } required error={!this.state.shopName}/>
          <Form.Dropdown label='Areas' multiple selection options={this.state.areaOptions} placeholder='Select areas' width={4} onChange={ this.updateSelectedArea.bind(this) } required error={!this.state.areaId}/>

        </Form.Group>
        <Form.Group widths={4}>
          <Form.Input label='mobile' placeholder='mobile' onChange={ this.updateInputValue.bind(this,'mobile')} required error={!this.state.mobile}/>
          <Form.Input label='email' placeholder='email' onChange={ this.updateInputValue.bind(this,'email')} required error={!this.state.email}/>
          <Form.Input label='password' placeholder='password' onChange={ this.updateInputValue.bind(this,'password')} required error={!this.state.password}/>
          <Form.Input label='confirm password' placeholder='password' onChange={ this.updateInputValue.bind(this,'confirmPassword')} required error={ !this.state.confirmPassword || !arePasswordsEqual }/>
        </Form.Group>
        <Form.Group widths={5}>
          <Form.Input label='address' placeholder='addressh' onChange={ this.updateInputValue.bind(this,'address')}/>
          <Form.Input label='GST' placeholder='GST' onChange={ this.updateInputValue.bind(this,'shopTin')} required error={!this.state.shopTin}/>
          <Form.Input label='city' placeholder='city' onChange={ this.updateInputValue.bind(this,'city')}/>
          <Form.Input label='district' placeholder='district' onChange={ this.updateInputValue.bind(this,'district')}/>
          <Form.Input label='state' placeholder='state' onChange={ this.updateInputValue.bind(this,'state')}/>
        </Form.Group>
        <Button onClick={ this.createUser.bind(this)} width={8}>Create User</Button>
        <Divider />
        { this.renderStatusMessage() }
      </Form>
    );
  }

  renderValidationMessage() {
    const { valid, msgHeader, msgContent } = this.validateMandatoryFields();
    if(!valid) {
      return(
        <Message
          warning
          header={msgHeader}
          content={msgContent}
        />
      )
    } else {
      return null;
    }
  }

  validateMandatoryFields() {
    const { name, shopName, areaId, mobile, email, password, confirmPassword, shopTin } = this.state;
    if( !name || !shopName || !areaId || !mobile || !email || !password || !confirmPassword || !shopTin) {
      return ({
        valid: false,
        msgHeader: 'Incomplete Form',
        msgContent: 'Fill all mandatory fields'
      });
    }

    if( mobile.length !== 10) {
      return ({
        valid: false,
        msgHeader: 'Invalid Mobile Number',
        msgContent: 'Mobile number has to have 10 digits'
      });
    }

    if( password !== confirmPassword) {
      return ({
        valid: false,
        msgHeader: 'Password Mismatch',
        msgContent: 'Confirm password is not same as password'
      });
    }

    return ({
      valid: true,
      msgHeader: '',
      msgContent: ''
    });

  }

  renderStatusMessage() {

    if(this.state.errMsg) {
      return (
        <Message
          error
          header='Error'
          content={this.state.errMsg}
        />
      )
    } else if (this.state.successMsg) {
      return (
        <Message
          success
          header='Success'
          content={this.state.successMsg}
        />
      )
    }

  }


  updateSelectedArea(e, {value}) {
    this.setState({
      areaId: value
    });
  }

  updateInputValue(field, event) {
    console.log(field + " changed to " + event.target.value);
    this.setState({
      [field]: event.target.value
    });
  }

  createUser() {
    console.log("user-data=", JSON.stringify(this.state,null,2));

    //_name_, _email_, _pass_, address,_shopName_,_proprietorName_,
    // _shopTin_,_shopNumber_,street,_areaId_,
    // district,city,state,pincode,taxType) {

    const { name, email, password, confirmPassword, mobile } = this.state;
    const { shopName, shopTin, areaId, city, district, state } = this.state;

    const proprietorName = name, shopNumber = mobile;
    const authRef = firebase.auth();
    const dbRef = firebase.database().ref();
  	const promise = authRef.createUserWithEmailAndPassword(email,password);
  	promise.then(e => {
      this.setState({
        errMsg: ''
      });
			//get the authId
      const authId = e.uid;
      console.log('Creating user - ', email);

    	//set the authMobilemapping
  		const authIdMobileMapRef = dbRef.child('authMobileMap/' + authId);
  		authIdMobileMapRef.set(shopNumber);

      //create the address

		 const fulladdress = shopNumber + " ; " +
    		district + " ; " +
    		city+";"
    		state;

    		// create shops
  		const shops = [{
      	name: shopName,
      	proprietor_name : proprietorName,
      	mobile : shopNumber,
      	tin : shopTin,
      	state : state,
      	areaId : areaId,
      	areaName : areaId,
      	district : district,
      	city : city,
      	address : fulladdress,
      	taxType : 'GST'
	    }];
    	//create the user object
  		let foo = {}; const now = (new Date().getTime()) * -1;
  		foo = {
  			email : email,
  			active: false,
  			name : name ,
  			mobile : shopNumber,
  			isAgent : false,
  			address : fulladdress,
  			authId : authId,
  			priority : now,
        areas: areaId
			};

			//set the user
  		const agentRef = dbRef.child(`agents/${authId}`);
      const promise = agentRef.set(foo).then(() => {
        this.setState({
          errMsg: '',
          successMsg: `user ${email} has been succesfully created.`
        })
      });

    }).catch(e => {
      console.log(e);
      this.setState({
        errMsg: e.message,
        successMsg: ''
      });
    });
  }
}

export default CreateUser;
