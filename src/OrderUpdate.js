import React, { Component } from 'react';
import * as firebase from 'firebase';
import AlertContainer from 'react-alert';
import { Button, Comment, Form, Header, Dropdown, Divider } from 'semantic-ui-react';
import Auth, { connectProfile, userInfo } from './auth';
import { Card } from 'semantic-ui-react';
import './OrderUpdate.css';
import moment from 'moment-es6';


const statusColorMap = {
  'public': 'blue',
  'internal': 'black',
  'printed': 'yellow',
  'onhold': 'orange',
  'cancelled': 'red',
  'dispatched': 'green',
  'received': '#ccccff',
  'onhold': '#ffebcc',
  'completed': '#9fdf9f',
  'dispatched': '#9fdf9f',
  'cancelled': '#ffb399',
  'pending': 'darkorange',
  'approve': 'lightgreen',
  'pending_approval': 'orange',
  paid: 'darkgreen'
  
}


class OrderUpdate extends Component {

  constructor(props) {
    super(props);
    this.defaultState = {
      updateMsg: '',
      msgType: 'internal',
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

  componentDidMount() {
    const updatesPath = `o/${this.props.orderId || this.props.params.orderId}/updates`;
    const updatesRef = firebase.database().ref().child(updatesPath);
    updatesRef.on('value', snap => {
      let updateArray = [];
      const updates = snap.val();
      if(updates) {
        Object.keys(updates).forEach (updateKey =>{
          updateArray.push(updates[updateKey]);
        });
        this.setState({
          updates: updateArray
        });
      }
    });

  }


  saveUpdate() {
    const that = this;
    const msgType = this.state.msgType;
    const orderPath = `o/${this.props.orderId || this.props.params.orderId}`;
    const orderUpdatesPath = `${orderPath}/updates`;
    const orderStatusPath = `${orderPath}/status`;
    const orderRef = firebase.database().ref().child(orderPath);
    const orderUpdatesRef = firebase.database().ref().child(orderUpdatesPath).push();
    const orderUpdateKey = orderUpdatesRef.getKey();
    const { nickname, name } = userInfo();

    const update = {
      'updateMsg': this.state.updateMsg,
      'msgType': msgType,
      'timestamp': moment().format('YYYY-MM-DD HH:mm:ssA'),
      'name': name,
      'nickname': nickname
    };

    const newStatusUpdate = {};
    newStatusUpdate['updates/' + orderUpdateKey] = update;

    if(msgType !== 'internal' && msgType !== 'public') {
      newStatusUpdate['status'] = msgType;
    }


    orderRef.update(newStatusUpdate, error => {
      if(error) {
        this.msg.error(<div className="error">Error while updating order <h4>{ this.props.orderId || this.props.params.orderId }</h4>: { error.message }</div>, {
          time: 2000,
          type: 'error',
        });
      } else {
        this.msg.success( <div className="success"><h4>{ this.props.orderId || this.props.params.orderId }</h4> is Successfully updated!</div>, {
          time: 2000,
          type: 'success',
        });
        that.setState({
            ...that.defaultState
        });
      }
    });
  }

  updateInputValue(field, event) {
    this.setState({
      [field]: event.target.value
    });
  }

  renderUpdateCards(updates) {
    let updateCards = [];
    const { nickname, name } = userInfo();


    if(updates && updates.length) {
      updates.forEach(update => {
        const m = moment(update.timestamp, 'YYYY-MM-DD HH:mm:ssA');
        const timeString = `${m.format('DD/MM/YY - HH:mm:ssA')} (${m.fromNow()})`;
        const color = statusColorMap[update.msgType];
        const textStyle = {
          color: color
        };
        updateCards.push(
          <Card color={ color }>
            <Card.Content>
              <Card.Header>
                { `${update.nickname}(${update.name})` }
              </Card.Header>
              <Card.Meta>
                { update.msgType }
              </Card.Meta>
              <Card.Description style={ textStyle }>
                { update.updateMsg }
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              { timeString }
            </Card.Content>
          </Card>
        );
      });
    }
    return updateCards;
  }

  saveMsgType(event, data) {
    this.setState({
      msgType: data.value
    });
  }

  saveMsg(event, data) {
    this.setState({
      updateMsg: data.value
    });
  }

  render() {

    const updates = this.state.updates;
    const updateTypes = [
      {
        key: 'approved',
        value: 'approved',
        text: 'STATUS: APPROVED'
      },
      {
        key: 'onhold',
        value: 'onhold',
        text: 'STATUS: ON HOLD'
      },
      {
        key: 'cancelled',
        value: 'cancelled',
        text: 'STATUS: CANCELLED'
      },
      {
        key: 'partialpaid',
        value: 'partialpaid',
        text: 'STATUS: PARTIALLY PAID'
      },
      {
        key: 'paid',
        value: 'paid',
        text: 'STATUS: PAID'
      },
      {
        key: 'internal',
        value: 'internal',
        text: 'INTERNAL UPDATE'
      },
      {
        key: 'public',
        value: 'public',
        text: 'PUBLIC UPDATE'
      },
      {
        key: 'printed',
        value: 'printed',
        text: 'ORDER PRINTED'
      },

    ];

    return (
      <div className="w-full rounded-lg shadow-lg bg-blue-200 py-4 pb-8">
        <h1 className='text-center text-2xl'>Update Status</h1>
        <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />
          <Comment.Group>
            { this.renderUpdateCards(updates) }
            <Divider />
            <Form reply>
              <Dropdown className='w-full py-4' upward selection options={ updateTypes } defaultValue='public' onChange={ this.saveMsgType.bind(this) } />

              <Form.TextArea onChange={ this.saveMsg.bind(this) } className='py-4' />
              <Button className="w-full save-button uppercase rounded-lg" content='Update' labelPosition='left' icon='edit' primary onClick={ this.saveUpdate.bind(this) } />
            </Form>
        </Comment.Group>
      </div>

    );

  }

}

export default OrderUpdate;
