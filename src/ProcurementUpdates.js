import React, {Component} from 'react';
import { Input, Button, Table, Form} from 'semantic-ui-react'
import * as firebase from 'firebase';
import {camelCaseToRegularCase, statusColorMap} from './utils/helper';
import moment from 'moment-es6';
import { userInfo } from './auth';
import AlertContainer from 'react-alert';

class AddAgent extends Component {

    constructor(props) {
        super();
        this.state = {
            isLoading: false,
            orderId: '210416N948',
            orderData: null,
            error: ''
        }
        this.fetchOrder = this.fetchOrder.bind(this);
        this.alertOptions = {
          offset: 20,
          position: 'top right',
          theme: 'light',
          time: 5000,
          transition: 'fade'
        };
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
            this.msg.error(<div className="error">Error while Saving <h4>{ this.state.paymentAmout }</h4>: { error.message }</div>, {
              time: 2000,
              type: 'error',
            });
            this.setState({paymetUpdateError: 'Unable to update payments. Try after sometime'})
          } else {

            this.msg.success( <div className="success"><h4>{ this.state.paymentAmout }</h4> is Successfully Saved</div>, {
              time: 2000,
              type: 'success',
            });

            this.setState({
              paymentText: '',
              paymentAmout: 0,
              paymetUpdateError: '',
              weightInTons: 0,
              shortageInTons: 0,
              shortageInTons: 0,
              ePrice: 0,
              purchaseNo: '',
              truckNo: '',
            });



          }
        });
      }

    renderUpdateForm() {
      const { weightInTons, shortageInTons, ePrice} = this.state;
        const actualWeightInQuintals = weightInTons*(1000-shortageInTons)/100;
        return (
            <Form onSubmit={this.handlePaymentUpdate} className='w-full py-8 px-8 my-12 shadow-lg rounded-lg bg-gradient-to-br from-blue-100 to-blue-300'>
                <Form.Group widths='equal'>
                    <Form.Input required={true} fluid label='Purchase No' placeholder='Purchase number' onChange={e => this.setState({purchaseNo: e.target.value})} />
                    <Form.Input required={true} fluid label='Truck No' placeholder='Truck number' onChange={e => this.setState({truckNo: e.target.value})}/>
                </Form.Group>
                <Form.Group widths='equal'>
                    <Form.Input type='number' required={true} fluid label='Weight in tons' placeholder='weight in tons' onChange={e => this.setState({weightInTons: parseFloat(e.target.value||'0')})}/>
                    <Form.Input type='number' required={true} fluid label='Bag Weight deduction in KGs per ton' placeholder='bag weight in kgs' onChange={e => this.setState({shortageInTons: parseFloat(e.target.value|| '0')})} />
                </Form.Group>

                <Form.Group widths='equal'>
                    <Form.Input type='number' required={true} fluid label='Price' placeholder='Price' onChange={e => this.setState({ePrice: e.target.value})}/>
                    <Form.Input type='number' disabled={true} required={true} fluid label='Actual Value' value={actualWeightInQuintals*ePrice} />
                    <Form.Input type='number' required={true} fluid label='Advance Payment' placeholder='Advane Payment amount' onChange={e => this.setState({paymentAmout: e.target.value})}/>
                </Form.Group>
                { actualWeightInQuintals && ePrice  ? <span>{`${actualWeightInQuintals} quintals @${ePrice} per quintal`}</span> : null}

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

    renderExistingPayments = () => {
      const {payments = {}} = this.state.orderData;
      return(
        <div className="w-full rounded-lg shadow-lg bg-green-200 py-4 my-8 px-8 pb-4">
          <p className='font-bold'>Payments made</p>
          {
            Object.keys(payments).length
            ? this.renderPaymentsTable()
            : null
          }
        </div>
      )
    }


    renderPaymentsTable = () => {

      const {payments} = this.state.orderData;
      const rowList = [];
      let totalPayments = 0;
      let totalWeightInTons = 0;
  
  
      Object.keys(payments).forEach((id, index) => {
        const {name, nickname, updateMsg, amount, timestamp, ePrice, weightInTons, truckNo} = payments[id];
        const m = moment(timestamp, 'YYYY-MM-DD hh:mm:ssA');
        totalPayments = totalPayments + parseFloat(amount);
        totalWeightInTons = totalWeightInTons + parseFloat(weightInTons || '0')
        rowList.push (
          <Table.Row >
            <Table.Cell>{index+1}</Table.Cell>
            <Table.Cell><p>{nickname||name} on <span className='font-bold text-blue-800'>{m.format('DD/MMM/YY HH:mm')}</span><span className='text-gray-400'>{' '}( {m.fromNow()})</span></p></Table.Cell>
            <Table.Cell>{updateMsg}</Table.Cell>
            <Table.Cell>{truckNo}</Table.Cell>
            <Table.Cell textAlign='right'>{weightInTons}</Table.Cell>
            <Table.Cell textAlign='right'>{ePrice}</Table.Cell>
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
            <Table.HeaderCell>Truck</Table.HeaderCell>
            <Table.HeaderCell>Weight in tons</Table.HeaderCell>
            <Table.HeaderCell>Price/Quintal</Table.HeaderCell>
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
            <Table.Cell textAlign='right' className='font-bold'>{totalWeightInTons.toLocaleString()}</Table.Cell>
            <Table.Cell ></Table.Cell>
            <Table.Cell textAlign='right' className='font-bold text-2xl'>{totalPayments.toLocaleString()}</Table.Cell>
          </Table.Row>
        </Table.Footer>
        </Table>
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
                    <li className='py-1'><strong>{agent.name || agent}</strong> placed a purchase order on <strong>{ timeString}</strong></li>
                    <li className='py-1'>area:<strong>{camelCaseToRegularCase(area)}</strong></li>
                    <li className='py-1'>party:<strong>{partyName}</strong></li>
                    <li className='py-1'><p>{partyDetails}</p></li>
                    <li className='py-4'>Order is <strong className='text-3xl'>{camelCaseToRegularCase(status)}</strong></li>
                </ul>
                {this.renderCart()}
                {this.renderExistingPayments()}
                {this.renderUpdateForm()}
            </div>


        )
    }

    renderPayments() {

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
                    <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />

                <h1 className='text-2xl text-green-600 text-center'>Payment Updates</h1>
                <div className='mx-auto px-20'>
                    <label className='mr-8'>Order ID</label>
                    <Input value={this.state.orderId} loading={isLoading} placeholder='Order ID' onChange={e => this.setState({orderId: (e.target.value||'').trim()})} />
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