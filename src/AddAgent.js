import React, { Component } from 'react';
import 'rc-collapse/assets/index.css';
import Button from 'react-button';
import * as firebase from 'firebase';
import AlertContainer from 'react-alert';

class AddAgent extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.alertOptions = {
      offset: 20,
      position: 'top right',
      theme: 'light',
      time: 5000,
      transition: 'fade'
    };

    this.defaultState = {
      agentId: '',
      name: '',
      mobile: '',
      mobile_alt: '',
      areas: ''
    };

    this.state = {
      ...this.defaultState
    };
  }

  saveAgent() {
    console.log("SAVING AGENT!");
    //Check uniqueness of agent ID
    const agentId = this.state.agentId;

    const agentRefPath = `agents/${agentId}`;
    const agentRef = firebase.database().ref().child(agentRefPath);
    const newAgentData = {
      'agentId': this.state.agentId,
      'name': this.state.name,
      'mobile': this.state.mobile,
      'mobile_alt': this.state.mobile_alt,
      'areas': this.state.areas,
      'outlets': []
    };

    agentRef.set(newAgentData, error => {
      if(error) {
        this.msg.error(<div className="error">Error while saving agent <h4>{ this.state.name }</h4>: { error.message }</div>, {
          time: 2000,
          type: 'error',
        });
      } else {
        this.msg.success( <div className="success"><h4>Agent { this.state.name }</h4> is Successfully Saved</div>, {
          time: 2000,
          type: 'success',
        });
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

  render() {

    const theme = {
        disabledStyle: { background: '#e6f5ff'},
        pressedStyle: {background: 'dark-blue', fontWeight: 'bold'},
        overPressedStyle: {background: 'dark-blue', fontWeight: 'bold'}
    };

    return (
      <div className="add-product">
      <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />

        <ul>
          <li>
            <label>Agent ID</label>
            <span>
              <input type="text"
                name="agentId"
                placeholder="unique key to identify agent"
                value={ this.state.agentId }
                onChange={ this.updateInputValue.bind(this,'agentId')}
                required >
              </input>
            </span>
          </li>

          <li>
            <label>Name</label>
            <span>
              <input type="text"
                name="name"
                placeholder="name of the agent"
                value={ this.state.name }
                onChange={ this.updateInputValue.bind(this,'name') }
                required>
              </input>
            </span>
          </li>
          <li>
            <label>mobile</label>
            <span>
              <input type="text"
                name="mobile"
                placeholder="+91 XXXXX XXXXX"
                value={ this.state.mobile }
                onChange={ this.updateInputValue.bind(this, 'mobile') }
                required>
              </input>
            </span>
          </li>
          <li>
            <label>Alternate Mobile</label>
            <span>
              <input type="text"
                name="mobile_alt"
                placeholder="+91 XXXXX XXXXX"
                value={ this.state.mobile_alt }
                onChange={ this.updateInputValue.bind(this, 'mobile_alt') }
                required>
              </input>
            </span>
          </li>
          <li>
            <label>Areas</label>
            <span>
              <input type="text"
                name="areas"
                placeholder="ex: vizag, tirupati"
                value={ this.state.areas }
                onChange={ this.updateInputValue.bind(this, 'areas') }
                required>
              </input>
            </span>
          </li>
          <li>
            <Button className="save-button" onClick={ this.saveAgent.bind(this) } theme={ theme } disabled={ !(this.state.agentId && this.state.name && this.state.mobile) }>ADD AGENT</Button>
          </li>
        </ul>

      </div>
    );
  }

}

export default AddAgent;
