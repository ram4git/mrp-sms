import React, {Component} from 'react';
import { Input, Button, Divider, Form } from 'semantic-ui-react'
import * as firebase from 'firebase';
import {camelCaseToRegularCase, statusColorMap} from './utils/helper';
import moment from 'moment-es6';
import { userInfo } from './auth';

class AddAgent extends Component {

    constructor(props) {
        super();
        this.state = {
            isLoading: false,
            orderId: '',
            orderData: null,
            error: ''
        }
        this.fetchOrder = this.fetchOrder.bind(this);
    }

    fetchOrder() {
        this.setState({isLoading: true, error: ''});
        const orderPath = `o/${this.state.orderId}`;
        console.log('order path=', orderPath);

        const orderRef = firebase.database().ref().child(orderPath);
        orderRef.on('value', snap => {
          const orderData = snap.val();
          console.log('OD=', orderData);
          if(orderData) {
              this.setState({orderData, isLoading: false})
          } else {
            this.setState({error: 'There is no order matching the orderId', isLoading: false})
          }
        });
    }

    handlePaymentUpdate = () => {
        const {id, agent, area, partyName, partyDetails, status, ts} = this.state.orderData;

        const orderPath = `o/${id}`;
        const orderPaymentsPath = `${orderPath}/payments`;
        const orderPaymentsRef = firebase.database().ref().child(orderPaymentsPath).push();
        const { nickname, name } = userInfo();

        const {purchaseNo, truckNo, weightInTons, shortageInTons, ePrice, paymentAmout, paymentText} = this.state;
    
        const update = {
          updateMsg: this.state.paymentText,
          timestamp: moment().format('YYYY-MM-DD HH:mm:ssA'),
          name: name,
          nickname: nickname,
          amount: this.state.paymentAmout,
          purchaseNo,
          truckNo,
          weightInTons,
          shortageInTons,
          ePrice,
          amount: paymentAmout,
          updateMsg: paymentText
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

    renderUpdateForm() {
        return (
            <Form onSubmit={this.handlePaymentUpdate} className='w-full py-8 px-8 my-12 shadow-lg rounded-lg bg-gradient-to-br from-blue-100 to-blue-300'>
                <Form.Group widths='equal'>
                    <Form.Input required={true} fluid label='Purchase No' placeholder='Purchase number' onChange={e => this.setState({purchaseNo: e.target.value})} />
                    <Form.Input required={true} fluid label='Truck No' placeholder='Truck number' onChange={e => this.setState({truckNo: e.target.value})}/>
                </Form.Group>
                <Form.Group widths='equal'>
                    <Form.Input type='number' required={true} fluid label='Weight in tons' placeholder='weight in tons' onChange={e => this.setState({weightInTons: parseFloat(e.target.value||'0')})}/>
                    <Form.Input type='number' required={true} fluid label='Shortage in tons' placeholder='shortage in tons' onChange={e => this.setState({shortageInTons: parseFloat(e.target.value|| '0')})}/>
                </Form.Group>

                <Form.Group widths='equal'>
                    <Form.Input type='number' required={true} fluid label='Price' placeholder='Price' onChange={e => this.setState({ePrice: e.target.value})}/>
                    <Form.Input type='number' required={true} fluid label='Payment' placeholder='Payment' onChange={e => this.setState({paymentAmout: e.target.value})}/>
                </Form.Group>
                <Form.Group inline>
                    <Form.Input
                        fluid
                        width={10}
                        name='notes'
                        required={true}
                        type='text'
                        placeholder='note'
                        value={this.state.paymentText}
                        onChange={e => this.setState({paymentText: e.target.value})}
                    />
                    <Form.Button width={6} fluid primary content='Update' />
                </Form.Group>


            </Form>
        )
    }

    renderOrderDetails() {
        const {id, agent, area, partyName, partyDetails, status, ts} = this.state.orderData;
        const timeString = moment(ts, 'YYYY-MM-DD HH:mm:ssA').format('DD/MMM/YY - HH:mm:ssA');


        const orderStatusColor = statusColorMap[status];

        return (
            <div className='mx-auto max-w-6xl detail'>
                <ul className="header rounded-lg shadow-lg my-8 overflow-hidden py-8" style={{backgroundColor: orderStatusColor, textAlign: 'center', listStyle: 'none' }}>
                    <li className='py-1'><h2 className='py-2'>{id}</h2></li>
                    <li className='py-1'><strong>{agent}</strong> placed a purchase order on <strong>{ timeString}</strong></li>
                    <li className='py-1'>area:<strong>{camelCaseToRegularCase(area)}</strong></li>
                    <li className='py-1'>party:<strong>{partyName}</strong></li>
                    <li className='py-1'><p>{partyDetails}</p></li>
                    <li className='py-4'>Order is <strong className='text-3xl'>{camelCaseToRegularCase(status)}</strong></li>
                </ul>
                {this.renderCart()}
                {this.renderUpdateForm()}
            </div>


        )
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
          const priceDifference = parseFloat(parseFloat(agentPrice) - parseFloat(lPrice));

        return (
          <div className="cart bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-lg py-2">
            <div className="summary w-full my-4">
              <table className="summary w-full">
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1"><p>Product<span>:</span></p></td>
                  <td className="w-1/2 text-align-start capitalize"><strong>{camelCaseToRegularCase(product)}</strong></td>
                </tr>
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>Area<span>:</span></p></td>
                  <td className="w-1/2 text-left"><strong>{camelCaseToRegularCase(area)}</strong></td>
                </tr>
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>Total Order Weight<span>:</span></p></td>
                  <td className="w-1/2 text-left"><strong>{quantityInTons}</strong> tons </td>
                </tr>
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>No of bags<span>:</span></p></td>
                  <td className="w-1/2 text-left"><strong>{noOfBags}</strong> </td>
                </tr>
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>Lalitha's Price<span>:</span></p></td>
                  <td className="w-1/2 text-green-600 text-right pr-20"><strong className='text-blue-600'>₹{parseFloat(lPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
    
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>Agent Price<span>:</span></p></td>
                  <td className="w-1/2 text-green-600 text-right pr-20"><span className={priceDifference > 0 ? 'bg-red-600 px-2 py-1 text-white font-bold rounded-md' : 'bg-green-600 px-2 py-1 text-white font-bold rounded-md mr-4'}>{priceDifference > 0 ? '+' : '' }{priceDifference}</span><strong className=''>₹{parseFloat(agentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
    
                <tr className='h-2 bg-gray-50'></tr>
                <tr className='p-1 my-2 w-full'>
                  <td className="text-right text-blue-700 py-1 w-1/2"><p>Total Price<span>:</span></p></td>
                  <td className="w-1/2 text-green-600 text-right pr-20 font-bold"><strong>₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
              </table>
            </div>
          </div>
        );
    
      }


    render() {
        const {isLoading, orderId, error, orderData} = this.state;

        return (
            <div className='mx-auto max-w-6xl'>
                <h1 className='text-2xl text-green-600 text-center'>Payment Updates</h1>
                <div className='mx-auto px-20'>
                    <label className='mr-8'>Order ID</label>
                    <Input loading={isLoading} placeholder='Order ID' onChange={e => this.setState({orderId: (e.target.value||'').trim()})} />
                    <Button primary className='ml-8' onClick={this.fetchOrder}> Search</Button>
                </div>
                <div>
                    {
                        error
                        ? <p className='text-red-600 font-bold text-center pt-12 pb-8'>{error}</p>
                        : null
                    }
                    {
                        orderData
                        ? this.renderOrderDetails()
                        : null
                    }
                </div>



            </div>
        )
    }
}

export default AddAgent;