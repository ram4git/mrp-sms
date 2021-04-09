import React, { Component } from 'react';
import * as firebase from 'firebase';
import ReactDataGrid from 'react-data-grid';
import ObjectAssign from 'object-assign';
import FaSave from 'react-icons/lib/fa/floppy-o';
import FaMail from 'react-icons/lib/fa/envelope-o';
import AlertContainer from 'react-alert';
import classnames from 'classnames';
import { Button, Menu, Loader } from 'semantic-ui-react';
import './PriceList.css';

const columnWidth = 140;

class NewPriceList extends Component {
  constructor(props) {
    super(props);

    this.alertOptions = {
      offset: 20,
      position: 'top left',
      theme: 'light',
      time: 5000,
      transition: 'fade'
    };

    this.state = {
      loading: true,
      rowsLoading: true,
      colsLoading: true,
      productType: 'rice',
      cols: {
        rice: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
            priority: -9999
          }
        ],
        ravva: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
            priority: -9999
          }
        ],
        broken: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
            priority: -9999
          }
        ]
      },
      rows: {
        rice: [],
        ravva: [],
        broken: []
      }
    };
  }

  render() {
  const { productType } = this.state

    return <div className="priceList">
      <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />
      <Menu fluid widths={5}>
        <Menu.Item name='rice' active={ productType === 'wheat' } onClick={this.handleItemClick} />
        <Menu.Item name='ravva' active={ productType === 'paddy' } onClick={this.handleItemClick} />
        <Menu.Item name='broken' active={ productType === 'broken' } onClick={this.handleItemClick} />
      </Menu>
      <div className="table">
        <p><span style={ {color: '#ecf2f9' } }>██ </span> is agent price. <span style={ {color: '#fff7e6' } }>██ </span> is outlet price </p>
        <p> 32</p>
        { this.renderPriceListButtons() }
        { this.renderPriceListTable() }
        { this.renderPriceListButtons() }
      </div>

    </div>

  }

  renderPriceListButtons = () => <div>
    <Button className="update-button" onClick={ this.updatePrices.bind(this) } disabled={ false }><FaSave />SAVE</Button>
    <Button className="sms-button" onClick={ this.sendSMS.bind(this) } disabled={ false }><FaMail />SEND SMS</Button>
  </div>;


  renderPriceListTable() {
    const { rowsLoading, colsLoading } = this.state;
    if(rowsLoading || colsLoading) {
      return <Loader />
    }

    const productType = this.state.productType;

    return <div>
      <p><span style={ {color: '#ecf2f9' } }>██ </span> is party price. <span style={ {color: '#fff7e6' } }>██ </span> is outlet price </p>
      <p>Double click on the price to change</p>

      <ReactDataGrid
        enableCellSelect={true}
        columns={this.state.cols[productType].sort((a,b) => {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : (a.className === 'outlet' ? 1 : -1));})}
        rowGetter={this.rowGetter.bind(this)}
        rowsCount={this.state.rows[productType].length}
        onGridRowsUpdated={this.handleGridRowsUpdated.bind(this)} />
    </div>
  }

  handleItemClick = (e, { name }) => this.setState({ productType: name });

  componentDidMount() {
    const areasRef = firebase.database().ref().child('areas');
    const productsRef = firebase.database().ref().child('products');

    //COLUMNS
    // Whats the source of truth for areas and products? PriceList Node or
    // individual products and areas

    areasRef.once('value', snap => {
      const areasArray = snap.val();
      let rows = ObjectAssign({},this.state.rows);

      ['rice','ravva','broken'].forEach( productType => {
        let productTypeRows = rows[productType];
        Object.keys(areasArray).forEach( areaKey => {
          const area = areasArray[areaKey];
          const rowData = ObjectAssign({},this.props.priceList[productType].rows[area.areaId]);
          const newRow = {
            area: area.displayName,
            key: area.areaId,
            ...rowData
          };
          productTypeRows.push(newRow);
        });
        rows[productType] = productTypeRows;
      });


      this.setState({
        rows: rows,
        rowsLoading: false
      });

    });

    productsRef.once('value', snap => {
      const products = snap.val();
      let cols = ObjectAssign([],this.state.cols);

      Object.keys(products).forEach( productType => {
        let productTypeCols = cols[productType];
        const productArray = products[productType];
        Object.keys(productArray).forEach( productKey => {
          const product = productArray[productKey];
          const productAgentKey = [productKey,'Agent'].join('$');
          const productOutletKey = [productKey,'Outlet'].join('$');
          const agentName = this.renderCustomProduct(product.name, 'Agent', productType, productKey);
          const outletName = this.renderCustomProduct(product.name, 'Party', productType, productKey);

          productTypeCols.push({
            key: productAgentKey,
            name: agentName,
            editable: true,
            width: columnWidth,
            resizable: true,
            className: 'agent',
            priority: product.priority
          });

          productTypeCols.push({
            key: productOutletKey,
            name: outletName,
            editable: true,
            width: columnWidth,
            resizable: true,
            className: 'outlet',
            priority: product.priority
          });

        });
        cols[productType] = productTypeCols;
      });


      this.setState({
        cols: cols,
        colsLoading: false
      });

    });

  }

  rowGetter(i) {
    return this.state.rows[this.state.productType][i];
  }

  handleGridRowsUpdated({ fromRow, toRow, updated, cellKey }) {
    const productType = this.state.productType;
    let rows = ObjectAssign({},this.state.rows);
    let productTypeRows = rows[productType].slice();

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = productTypeRows[i];
      let updatedRow = ObjectAssign({}, rowToUpdate, { ...updated });
      productTypeRows[i] = updatedRow;
    }
    rows[productType] = productTypeRows;
    this.setState({ rows });
  }

  getSize() {
    const productType = this.state.productType;
    if(this.state && this.state.rows) {
      return this.state.rows[productType].length;
    } else {
      return 0;
    }
  }

  updatePrices() {
    //TODO
    // incorporate productType
    const archiveLocRef = firebase.database().ref().child('priceListArchive');
    const priceListRef = firebase.database().ref().child('priceList');
    //CHECK IF THERE ARE ANY CHANGES

    let currentPriceList = {};


    //SAVE CURRET PRICES
    priceListRef.once('value', snap => {
      currentPriceList = snap.val();
    });


    const rows = this.state.rows;
    const updatePriceList =  {};

    Object.keys(rows).forEach(productType => {
      const productRows = rows[productType];
      productRows.forEach(row => {
        const { key } = row;
        if(!( key in updatePriceList )) {
          updatePriceList[key] = {
            rice: {},
            ravva: {},
            broken: {}
          };
        }
        updatePriceList[key][productType] = this.rowToDbObject(row);
      });

    });
    console.log("UPDTED PRICE LIST: "+ JSON.stringify(updatePriceList, null, 2));

    //NOT THE RIGHT COMPARISION, REVISIT LATER
    if(JSON.stringify(currentPriceList) === JSON.stringify(updatePriceList)) {
      this.msg.info(<div className="error">NO CHANGE</div>, {
        time: 2000,
        type: 'error',
      });

    } else {
      //Archive existing price list
      const date = new Date();
      const currentTime = date.getTime().toString();
      archiveLocRef.push({
        timestamp: currentTime,
        data: currentPriceList
      }, error => {
        if(error) {
          this.msg.error(<div className="error">Error while archiving old price list: { error.message }</div>, {
            time: 2000,
            type: 'error',
          });

        } else {
          this.msg.success( <div className="success">Old Price List is Successfully archived</div>, {
            time: 2000,
            type: 'success',
          });
        }
      });

      //save new price list
      priceListRef.set(updatePriceList, error => {
        if(error) {
          this.msg.error(<div className="error">Error while saving price list: { error.message }</div>, {
            time: 2000,
            type: 'error',
          });

        } else {
          this.msg.success( <div className="success">Price List is Successfully Saved</div>, {
            time: 2000,
            type: 'success',
          });
        }
      });
    }
  }

  sendSMS() {
    console.log("SENDING SMSes");
  }

  rowToDbObject(row) {
    // console.log("ROW: "+ JSON.stringify(row, null, 2));
    let dbObject = {};
    if(row) {
      Object.keys(row).forEach(key => {
        const value = row[key];
        const [ product, priceType ] = key.split('$');
        if(priceType) {
          if(!dbObject[product]) {
            dbObject[product] = {
              Agent: '',
              Outlet: ''
            };
          }
          dbObject[product][priceType] = value || '';
        }

      });
    }
    return dbObject;
  }

  dbObjectToRow() {
    //console.log("DB OBJECT: "+ JSON.stringify(row, null, 2));
    let row = {};
    return row;
  }

  renderCustomProduct(productName, priceType, productType, productKey) {
    const imgBaseUrl = `https://mrps-orderform.firebaseapp.com/${productType}_200/`;
    const imgUrl = `${imgBaseUrl}${productKey}.png`;
    return (
      <div className="productHeader">
        <div className="productType">{ `${productName}` }</div>
        <img  src={imgUrl} alt={productKey} width="100"/>
        <div className="priceType">{ `${priceType}` }</div>
      </div>
    );
  }

}

export default NewPriceList;
