import React, { Component } from 'react';
import * as firebase from 'firebase';
import Auth, { connectProfile, userInfo } from './auth';
import Items from './Items';
import './OrderSheet.css';
import { Divider, Table, Loader } from 'semantic-ui-react';
import moment from 'moment-es6';
import {camelCaseToRegularCase} from './utils/helper';


const LOADING = 'loading';
const ERROR = 'error';

class OrderSheet extends Component {

  constructor(props) {
    super(props);
    this.state = {
      orderData: {
        loading: LOADING
      }
    };
  }

  renderItems(items) {
    return <Items items={items} />
  }

  renderShop(detail) {
    const { name, area, city, shopGrossAmount, totalWeight, items, mobile, tin, areaId} = detail;
    const totalShopPriceNumber = +shopGrossAmount
    const totalShopPriceFixed = totalShopPriceNumber.toFixed(2);
    return (
      <div className="shop" key={ name }>
        <div className="details" key={area}>
          <h3>{ name }, { areaId }, GST: { tin ? tin : '___________' },<span className="special"> 📞: {` ${mobile}`}, {city}</span></h3>
          { this.renderItems(items) }
          <h4><strong>{totalWeight}</strong> quintals for <strong>₹{parseFloat(totalShopPriceFixed).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></h4>
        </div>
      </div>
    );
  }


  renderSpecialMsg(msg) {
    if(!msg) {
      return;
    }
    return (
      <div className="p-4 bg-yellow-200 rounded-lg my-4 shadow-lg">
        <p className='text-lg text-blue-600 text-center'>{ msg }</p>
      </div>
    );
  }

  getAbstractOrder() {
    const { discount_amount, totalPrice, grossPrice, shopDetail, selectedLorrySize, totalWeight } = this.state.orderData.cart;
    const abstractOrder = {};
    shopDetail.forEach( shop => {
      const { name, area, city, shopGrossAmount, totalWeight, items} = shop;
      if(items){
        let counter = 0;
        Object.keys(items).forEach( productType => {
          const itemsObject = items[productType];
          if(itemsObject) {
            Object.keys(itemsObject).forEach( itemId => {
              const item = itemsObject[itemId];
              let discount = item.quintalWeightPrice - item.discountedQuintalPrice;
              if(discount) {
                discount.toFixed(2);
              }
              let grossPrice = item.quintalWeightPrice*item.weight;
              const { name, weight, bags, price } = item;

              if(abstractOrder[itemId]) {
                const { weight:oldWeight, bags:oldBags, discount:oldDiscount, grossPrice:oldGrossPrice } = abstractOrder[itemId];
                const itemDetails = abstractOrder[itemId];
                itemDetails.weight = +oldWeight + +weight;
                itemDetails.bags = +oldBags + +bags;
                itemDetails.discount = +oldDiscount + +discount;
                itemDetails.grossPrice = +oldGrossPrice + +grossPrice;
              } else {
                abstractOrder[itemId] = {
                  name,
                  weight,
                  bags,
                  price: price.toFixed(2),
                  grossPrice: grossPrice.toFixed(2),
                  discount,
                };
              }
            });
          }
        });
      }
    });
    return abstractOrder;
  }

  renderAbstractOrderDetails() {
    const abstractOrder = this.getAbstractOrder();
    return (
      <Table size="bordered sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Quintals</th>
            <th>Bags</th>
            <th>Gross Price</th>
            <th>Discount/Qtl</th>
            <th>Net Price</th>
          </tr>
        </thead>
        <tbody>
          { this.getAbstractRows(abstractOrder) }
        </tbody>
        </Table>
    );
  }

  getAbstractRows(abstractOrder) {
    let counter = 1;
    const rows = [];
    let totalWeight = 0;
    let totalPrice = 0;
    let totalBags = 0;
    Object.keys(abstractOrder).map( itemId => {
      const { name, weight, bags, grossPrice, discount, price } = abstractOrder[itemId];
      totalWeight = (+totalWeight) + (+weight);
      totalPrice = (+totalPrice) + (+grossPrice);
      totalBags = (+totalBags) + (+bags);

      rows.push(
        <tr key={ counter }>
          <td scope="row">{ counter++ }</td>
          <td className="name">{ name }</td>
          <td className="number">{ weight }</td>
          <td className="number">{ bags }</td>
          <td className="price">{ parseFloat(grossPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="price">{ discount }</td>
          <td className="price">{ parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }</td>
        </tr>
      );

    });
    console.log(`TOTAL WEIGHT= ${totalWeight}, TOTAL PRICE= ${totalPrice}`);

    rows.push(
      <tr key={ counter } className="total">
        <td scope="row"></td>
        <td className="name">TOTAL</td>
        <td className="number">{ totalWeight }</td>
        <td className="number">{ totalBags }</td>
        <td className="price"></td>
        <td className="price"></td>
        <td className="price"></td>
      </tr>
    );
    return rows;

  }


  renderPartyDetails() {
    const {          area,
      agent,
      lPrice,
      agentPrice,
      party,
      quantityInTons,
      noOfBags,
      total,
      partyName,
      partyDetails} = this.state.orderData;

      return (
        <div className="cart" className='py-4 px-4 border border-w-1 border-gray-900'>
          <div className="summary w-full my-4 ">
          <table className="summary">
            <tr className='p-2 my-2'>
              <td className="w-1/4 text-blue-700 py-1"><h3>Agent<span>:</span></h3></td>
              <td className="text-align-start capitalize">{agent.name || agent}</td>
            </tr>
            <tr className='p-2 my-2'>
              <td className="w-1/4 text-blue-700 py-1"><h3>PartyName<span>:</span></h3></td>
              <td className="text-align-start capitalize">{partyName}</td>
            </tr>
            <tr className='p-2 my-2'>
              <td className="w-1/4 text-blue-700 py-1"><h3>Party Details<span>:</span></h3></td>
              <td className="text-align-start capitalize">{partyDetails}</td>
            </tr>
            <tr className='p-2 my-2'>
              <td className="w-1/4 text-blue-700 py-1"><h3>Area<span>:</span></h3></td>
              <td className="text-align-left">{camelCaseToRegularCase(area)}</td>
            </tr>
            </table>
          </div>
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

      const priceDifference = parseFloat(agentPrice) - parseFloat(lPrice);


    return (
      <div className="cart" style={{textAlign: 'center'}}>
        <div className="summary w-full my-4 border border-w-1 border-gray-900 py-4">
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
              <td className="key text-blue-700 py-1"><h3>Lalitha's Price<span>:</span></h3></td>
              <td className="value text-green-600"><strong>₹{parseFloat(lPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>

            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Agent Price<span>:</span></h3></td>
              <td className="value text-green-600"><span className={priceDifference > 0 ? 'bg-red-600 px-2 py-1 text-white font-bold rounded-md' : 'bg-green-600 px-2 py-1 text-white font-bold rounded-md mr-4'}>{priceDifference > 0 ? '+' : '-' }{priceDifference}</span><strong className=''>₹{parseFloat(agentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>

            <tr className='h-2 bg-gray-50'></tr>
            <tr className='p-1 my-2'>
              <td className="key text-blue-700 py-1"><h3>Total Price<span>:</span></h3></td>
              <td className="value text-green-600 font-bold"><strong>₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
        </div>
      </div>
    );
  }

  renderCart2(cart) {
    const { discount_amount, totalPrice, grossPrice, shopDetail, selectedLorrySize, totalWeight } = cart;
    const shops = [];
    shopDetail.forEach( shop => {
      shops.push(this.renderShop(shop));
    });

    const totalPriceFixed = (+totalPrice).toFixed(2);
    const totalDiscount = (+discount_amount).toFixed(2);
    const totalWeightInTons = (+totalWeight)/10;
    let weightStatusColor = '#40bf80';
    if(totalWeightInTons > (+selectedLorrySize)) {
      weightStatusColor = '#ff3333';
    }


    return (
      <div className="cart">
        <div className="shopsDetails">
          <h3>Orders</h3>
          <hr />
          { shops }
        </div>
        <div className="summary">
          <h3>Summary</h3>
            <Divider />
            <table className="summary">
              <tr>
                <td className="key">Total Price<span>:</span></td>
                <td className="value"><strong>₹{parseFloat(totalPriceFixed).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
              <tr>
                <td className="key">Total Discount<span>:</span></td>
                <td className="value"><strong>₹{parseFloat(totalDiscount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
              <tr>
                <td className="key">Total Order Weight<span>:</span></td>
                <td className="value"><strong>{totalWeightInTons}</strong> tons </td>
              </tr>
              <tr>
                <td className="key">Vehicle Capacity<span>:</span></td>
                <td className="value"><strong style={{color: weightStatusColor}}>{selectedLorrySize}</strong> tons</td>
              </tr>
            </table>
            <Divider />
        </div>
      </div>
    );

  }

  componentDidMount() {
    const orderPath = `o/${this.props.params.orderId}`;
    const orderRef = firebase.database().ref().child(orderPath);
    orderRef.on('value', snap => {
      const orderData = snap.val();
      if(orderData) {
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

    const databaseRef = firebase.database().ref().child(orderPath).child('printsCount');
    databaseRef.transaction((printsCount) => {
      if(printsCount) {
        printsCount = printsCount + 1;
      } else {
        printsCount = 1;
      }
      this.setState({
        printsCount
      });
      return printsCount;
    });

  }


  render() {

    if(this.state.orderData.loading === LOADING) {
      return <Loader />
    }

    const { nickname, name } = userInfo();
    const {agent} = this.state.orderData;
    const timeString = moment().format('DD/MMM/YY - HH:mm:ssA');

    return (
      <div className="orderData page">
        { this.renderPageHeader() }
        { this.renderOrderDetails() }
        { this.renderMainOrder() }
        {/* { this.renderAbstractOrder() } */}
        <footer>printed at { timeString } by <strong>{ nickname }</strong> ({ name })</footer>
      </div>
    );
  }

  renderPageHeader() {
    return (
      <div className="printPageHeader">
        <h5>Sree Lalitha Industries Pvt Ltd.</h5>
        <hr />
      </div>
    );
  }

  renderMainOrder() {
    return (
      <div>
        {this.renderPartyDetails()}
        { this.renderCart(this.state.orderData.cart) }
        { this.renderSpecialMsg(this.state.orderData.orderMsg) }
      </div>
    );
  }

  renderOrderDetails() {
    const { time, userName, ts, agent} = this.state.orderData;
    const orderId = this.props.params.orderId;
    const m = moment(ts, 'YYYY-MM-DD - HH:mm:ssA');
    const orderTimeString = m.format('DD/MMM/YY - HH:mm:ssA');
    const currentTimeString = moment().format('DD/MMM/YY - HH:mm:ssA')
    const delayInHours = m.toNow(true);

    debugger;

    return (
      <div className="orderHeader">
        <h3>{ agent.name ? agent.name : agent }<span>{`'s Order`}</span></h3>
        <h3>{ orderId }</h3>
        <table>
          <tr>
            <td className="key">order time<span>:</span></td>
            <td className="value">{ orderTimeString }</td>
          </tr>
          <tr>
            <td className="key">print time<span>:</span></td>
            <td className="value">{ currentTimeString } ( after { delayInHours })</td>
          </tr>
          <tr>
            <td className="key">NO OF PRINTS<span>:</span></td>
            <td className="value">{this.state.printsCount}</td>
          </tr>
        </table>
      </div>
    );
  }

  renderAbstractOrder() {
    return (
      <div className="abstract details">
        <h4>ABSTRACT ORDER</h4>
        <hr />
        { this.renderAbstractOrderDetails() }
      </div>
    );
  }

}
export default OrderSheet;
