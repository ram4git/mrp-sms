import React, { Component } from 'react';
import * as firebase from 'firebase';
import Items from './Items';
import './Order.css';
import OrderUpdate from './OrderUpdate';
import classNames from 'classnames';
import FaEyeClose from 'react-icons/lib/fa/eye-slash';
import FaEyeOpen from 'react-icons/lib/fa/eye';
import moment from 'moment-es6';
import { Button, Modal, Header, Image, Divider, Table, Loader, Form } from 'semantic-ui-react';
import {camelCaseToRegularCase} from './utils/helper';

import { userInfo } from './auth';

const LOADING = 'loading';
const ERROR = 'error';

const statusColorMap = {
  'received': '#ccccff',
  'onhold': '#ffebcc',
  'completed': '#9fdf9f',
  'dispatched': '#9fdf9f',
  'cancelled': '#ffb399'
}

class Order extends Component {

  constructor(props) {
    super(props);
    this.state = {
      orderData: {
        loading: LOADING
      },
      open: false,
      isAgent: false,
      paymentUpdate: {
        amount: 0,
        text: 0
      }
    };
  }

  show = (dimmer) => () => this.setState({ dimmer, open: true })
  close = () => this.setState({ open: false })

  componentDidMount() {
    const orderPath = `o/${this.props.params.orderId}`;
    const orderRef = firebase.database().ref().child(orderPath);
    orderRef.on('value', snap => {
      const orderData = snap.val();
      if(orderData) {
        console.log(orderData);
        let path = 'users' + '/' + orderData.uid;
        console.log(path);
         const usersRef = firebase.database().ref().child(path)
         usersRef.once('value', data =>{
           let userData = data.val();
           if(userData.isAgent) {
             this.setState({
               isAgent : true
             })
           }
         })
        this.setState({
          orderData
        });
      } else {
        this.setState({
          orderData: {
            loading: ERROR
          }
        });
      }
    });

    console.log(this.props);
  }


  renderItems(items) {
    return <Items items={items} />
  }

  renderShop(detail) {
    const { name, area, city, shopGrossAmount, totalWeight, items, areaId, tin, address} = detail;
    const totalShopPriceNumber = +shopGrossAmount
    const totalShopPriceFixed = totalShopPriceNumber.toFixed(2);
    return (
      <div className="shop" key={ name }>
        <div className="details" key={area}>
          <h3>{name}, <span className="area">{address}</span> GST:<span className="gst">{`  ${tin}`}</span></h3>
          { this.renderItems(items) }
          <h4><strong>{totalWeight}</strong> quintals for <strong>₹{parseFloat(totalShopPriceFixed).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></h4>
        </div>
      </div>
    );
  }


  renderSpecialMsg(msg) {
    return (
      <div className="p-4 bg-yellow-400 rounded-lg my-4 shadow-lg">
        <h1 className='font-bold text-2xl text-blue-900 text-center'>Agent's Message</h1>
        <p className='text-2xl text-blue-600 text-center'>{ msg }</p>
      </div>
    );
  }

  renderCart() {
    const {          area,
      product,
      lPrice,
      agentPrice,
      party,
      quantityInTons,
      noOfBags,
      total,
      partyDetails} = this.state.orderData;




    return (
      <div className="cart" style={{textAlign: 'center'}}>
        <div className="summary w-full my-4 rounded-lg shadow-lg">
          <Divider />
          <table className="summary">
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Product<span>:</span></h3></td>
              <td className="value text-align-start capitalize"><strong>{camelCaseToRegularCase(product)}</strong></td>
            </tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Area<span>:</span></h3></td>
              <td className="value text-align-left"><strong>{camelCaseToRegularCase(area)}</strong></td>
            </tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Total Order Weight<span>:</span></h3></td>
              <td className="value text-align-left"><strong>{quantityInTons}</strong> tons </td>
            </tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>No of bags<span>:</span></h3></td>
              <td className="value text-align-left"><strong>{noOfBags}</strong> </td>
            </tr>

            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Agent Price<span>:</span></h3></td>
              <td className="value text-green-600"><strong>₹{parseFloat(agentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Lalitha's Price<span>:</span></h3></td>
              <td className="value text-green-600"><strong>₹{parseFloat(lPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
            <tr className='h-2 bg-gray-50'></tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Total Price<span>:</span></h3></td>
              <td className="value text-green-600 font-bold"><strong>₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
          <Divider />
        </div>
      </div>
    );

  }


  renderUpdateSection = () => {
    return <OrderUpdate orderId={this.props.params.orderId} />
  }

  handlePaymentUpdate = () => {

    const orderPath = `o/${this.props.params.orderId}`;
    const orderPaymentsPath = `${orderPath}/payments`;
    const orderPaymentsRef = firebase.database().ref().child(orderPaymentsPath).push();
    const { nickname, name } = userInfo();

    const update = {
      updateMsg: this.state.paymentText,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ssA'),
      name: name,
      nickname: nickname,
      amount: this.state.paymentAmout
    };



    orderPaymentsRef.update(update, error => {
      if(error) {
        this.setState({paymetUpdateError: 'Unable to update payments. Try after sometime'})
      } else {
        this.setState({
          paymentText: '',
          paymentAmout: 0,
          paymetUpdateError: ''
        })
      }
    });
  }

  renderPaymentsTable = () => {

    const {payments} = this.state.orderData;
    const rowList = [];
    let totalPayments = 0;


    Object.keys(payments).forEach((id, index) => {
      const {name, nickname, updateMsg, amount, timestamp} = payments[id];
      const m = moment(timestamp, 'YYYY-MM-DD HH:mm:ssA');
      totalPayments = totalPayments + parseFloat(amount);
      rowList.push (
        <Table.Row >
          <Table.Cell>{index+1}</Table.Cell>
          <Table.Cell><p>{nickname||name} on <span className='font-bold text-blue-800'>{m.format('DD/MMM/YY HH:mm')}</span><span className='text-gray-400'>{' '}( {m.fromNow()})</span></p></Table.Cell>
          <Table.Cell>{updateMsg}</Table.Cell>
          <Table.Cell textAlign='right' className='font-bold text-xl'>{amount.toLocaleString()}</Table.Cell>
        </Table.Row>
      )
    });

    return (
      <Table celled className='my-8'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Updated</Table.HeaderCell>
          <Table.HeaderCell>Notes</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rowList}
      </Table.Body>
      <Table.Footer>
        <Table.Row >
          <Table.Cell></Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell className='font-bold'>Total</Table.Cell>
          <Table.Cell textAlign='right' className='font-bold text-2xl'>{totalPayments.toLocaleString()}</Table.Cell>
        </Table.Row>
      </Table.Footer>
      </Table>
    )
  }


  renderUpdatePayment = () => {
    const {payments = {}} = this.state.orderData;
    return(
      <div className="w-full rounded-lg shadow-lg bg-blue-200 py-4 my-8 px-8">
      <h1 className='text-center text-2xl'>Payments</h1>

      <p className='font-bold'>Payments made</p>
      {
        Object.keys(payments).length
        ? this.renderPaymentsTable()
        : null
      }
      <div className='w-full flex flex-row mx-auto mx-4'>

      <Form onSubmit={this.handlePaymentUpdate} className='w-full'>
          <Form.Group>
            <Form.Input
              name='amount'
              required={true}
              type='number'
              min={0}
              placeholder='amount'
              width={4}
              value={this.state.paymentAmout}
              onChange={e => this.setState({paymentAmout: e.target.value})}
            />
            <Form.Input
              width={10}
              name='notes'
              required={true}
              type='text'
              placeholder='note'
              value={this.state.paymentText}
              onChange={e => this.setState({paymentText: e.target.value})}
            />
            <Form.Button width={2} primary content='Update' />
          </Form.Group>
        </Form>
        {
          this.state.paymetUpdateError ?
          <p className='text-center text-red-800 font-bold text-lg'>{this.state.paymetUpdateError}</p> : 
          null
        }
      </div>
      </div>
    )
  }

  render() {

    if(this.state.orderData.loading === LOADING) {
      return <Loader />
    }

    const { status, ts, agent} = this.state.orderData;
    if(this.state.orderData.loading === ERROR) {
      return (
        <div>
          <div className="order">
            <div className="detail">
              <ul className="header" style={{backgroundColor: ' #ff6666', textAlign: 'center', listStyle: 'none' }}>
                <li><h1>{orderId}</h1></li>
                <li>Order <strong>{orderId}</strong> does not exist. Check URL again...</li>
              </ul>
            </div>
          </div>
        </div>

      );

      <h4>Order does not exist</h4>
    }
    const timeString = moment(ts, 'YYYY-MM-DD HH:mm:ssA').format('DD/MMM/YY - HH:mm:ssA');
    const orderStatusColor = statusColorMap[status];
    const orderId = this.props.params.orderId;

    const {area, partyName , partyDetails} = this.state.orderData;


    return (

      <div>
        <div className="order">
          <div className="detail">
            <div className="actionIcons">
              <Button.Group>
                <Button labelPosition='left' icon='left chevron' content='Previous Order' />
                <a href={ `/order/updates/${orderId}` } target="_blank">
                  <Button icon='edit' content='Updates' onClick={ this.show(true) }/>
                </a>
                <a href={ `/print/${orderId}` } target="_blank">
                  <Button icon='print' content='Print' />
                </a>
                <Button labelPosition='right' icon='right chevron' content='Next Order' />
              </Button.Group>
            </div>
            <ul className="header rounded-lg shadow-lg" style={{backgroundColor: orderStatusColor, textAlign: 'center', listStyle: 'none' }}>
              <li className='py-1'><h2 className='py-2'>{orderId}</h2></li>
              <li className='py-1'><strong>{agent}</strong> placed a purchase order on <strong>{ timeString}</strong></li>
              <li className='py-1'>area:<strong>{camelCaseToRegularCase(area)}</strong></li>
              <li className='py-1'>party:<strong>{partyName}</strong></li>
              <li className='py-1'><p>{partyDetails}</p></li>
              <li className='py-4'>Order is <strong className='text-3xl'>{status}</strong></li>
            </ul>
            { this.renderCart(this.state.orderData.cart) }
            { this.renderSpecialMsg(this.state.orderData.orderMsg) }
            {this.renderUpdatePayment()}

            {this.renderUpdateSection()}
          </div>
        </div>
        <footer>© MRP Solutions 2017</footer>
      </div>
    );
  }

  showPrintPage() {


    return true;
  }

}

export default Order;
