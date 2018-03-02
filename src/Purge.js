import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Button, Header } from 'semantic-ui-react';
import moment from 'moment';



let count = 0;


class Purge extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return  (
      <div className='purge'>
        <Button primary onClick={ this.onClick.bind(this) }>CLICK TO PURGE OLDER ORDERS</Button>
        <Header center>{this.state.msg}</Header>
      </div>
    );
  }

  onClick(e) {
    const ordersRef = firebase.database().ref().child('orders');
    let count = 0;
    ordersRef.once('value', snapshot => {
      const orders = snapshot.val();
      Object.keys(orders).forEach( orderId => {
        const order = orders[orderId];
        const orderTime = order.time;
        const orderDate = moment(orderTime).format('DD-MM-YYYY');
        //console.log(`${count++} | ${orderDate} | ${orderId}`);
        if (moment(orderTime).isBefore(moment().subtract(1, 'months'))) {
          //console.log(orderId + ' is older than a month and is on ' + orderDate);
          const updates = {};
          updates[ `/oldOrders/${orderDate}/${orderId}`] = order;
          updates[`/orders/${orderId}`] = null;
          firebase.database().ref().update(updates)
          .catch(e => {
            console.log(`Unable to archive ${orderId}`, e);
            this.setState({
              msg: 'Unable to archive old order ' + orderId
            })
          });
        }
      });
    });
    this.setState({
      msg: 'Successfully archived old orders'
    });
  }

}

export default Purge;
