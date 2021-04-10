import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router';
import { Button, Form, Message, Divider, Dropdown } from 'semantic-ui-react'
import * as firebase from 'firebase';




class CreateParty extends Component {

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
      <Form className="createParty" as="div" success error warning>
        { this.renderValidationMessage() }
        <Form.Group unstackable widths={3}>
          <Form.Input label='Party Name' placeholder='party name' width={6} onChange={ this.updateInputValue.bind(this,'partyName') } required error={!this.state.name}/>
          <Form.Input label='Firm Name' placeholder='firm Name'width={6} onChange={ this.updateInputValue.bind(this,'firmName') } required error={!this.state.shopName}/>
          <Form.Dropdown label='Areas' selection options={this.state.areaOptions} placeholder='Select areas' width={4} onChange={ this.updateSelectedArea.bind(this) } required error={!this.state.areaId}/>
        </Form.Group>
        <Form.Group widths={3}>
          <Form.Input label='mobile' placeholder='mobile' onChange={ this.updateInputValue.bind(this,'mobile')} required error={!this.state.mobile} type='number' />
          <Form.Input label='GST' placeholder='GST' onChange={ this.updateInputValue.bind(this,'GST')} required error={!this.state.email}/>
          <Form.Input label='addr' placeholder='address' onChange={ this.updateInputValue.bind(this,'addr')} required error={!this.state.password}/>
        </Form.Group>
        <Button onClick={ this.createParty.bind(this)} width={8}>Create Party</Button>
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
      console.log('AREA is changed to', value);
    this.setState({
      area: value
    });
  }

  updateInputValue(field, event) {
    console.log(field + " changed to " + event.target.value);
    this.setState({
      [field]: event.target.value
    });
  }

  createParty() {

    const {partyName, firmName, area, mobile, GST, addr} = this.state;
    const partyData = {
        partyName, firmName, area, mobile, GST, addr
    };

    
    const update = {};
    const partyRef = `p/${this.props.authId}/parties/${mobile}`;
    update[partyRef] = partyData;

    firebase.database().ref().update(update).then(() => {
        this.setState({
          errMsg: '',
          successMsg: `user ${partyName} has been succesfully created.`,
        })
        this.props.closeModal();
    }).catch(e => {
      console.log(e);
      this.setState({
        errMsg: e.message,
        successMsg: ''
      });
    });
  }
}

export default CreateParty;
