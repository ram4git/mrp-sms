import React, { Component } from 'react';
import * as firebase from 'firebase';
import ReactDataGrid from 'react-data-grid';
import ObjectAssign from 'object-assign';
import Button from 'react-button';
import FaSave from 'react-icons/lib/fa/floppy-o';
import FaMail from 'react-icons/lib/fa/envelope-o';
import AlertContainer from 'react-alert';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';




const columnWidth = 140;

//TODO
// Show previous price
//http://adazzle.github.io/react-data-grid/examples.html#/customRowRenderer

class PriceList extends Component {
  constructor(props) {
    super(props);

    this.alertOptions = {
      offset: 20,
      position: 'top left',
      theme: 'light',
      time: 5000,
      transition: 'fade'
    };

    this.changeProductType = this.changeProductType.bind(this);
    this.state = {
      productType: 'rice',
      cols: {
        rice: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
          }
        ],
        ravva: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
          }
        ],
        broken: [
          {
            key: 'area',
            name: '↓Area/Product→',
            resizable: true,
            width: 400,
            locked: true,
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

  changeProductType(productType) {
    if (this.state.productType !== productType) {
      this.setState({
        productType: productType
      });
    }
  }

  componentDidMount() {
    const areasRef = firebase.database().ref().child('areas');
    const productsRef = firebase.database().ref().child('products');

    //COLUMNS
    // Whats the source of truth for areas and products? PriceList Node or
    // individual products and areas
    productsRef.on('value', snap => {
      const products = snap.val();
      let cols = ObjectAssign([],this.state.cols);

      Object.keys(products).forEach( productType => {
        let productTypeCols = cols[productType];
        const productArray = products[productType];
        Object.keys(productArray).forEach( productKey => {
          const product = productArray[productKey];
          const productAgentKey = [productKey,'Agent'].join('$');
          const productOutletKey = [productKey,'Outlet'].join('$');

          productTypeCols.push({
            key: productAgentKey,
            name: product.name + ' Agent',
            editable: true,
            width: columnWidth,
            resizable: true,
            className: 'agent'
          });

          productTypeCols.push({
            key: productOutletKey,
            name: product.name + ' Outlet',
            editable: true,
            width: columnWidth,
            resizable: true,
            className: 'outlet'
          });
        });
        cols[productType] = productTypeCols;
      });

      this.setState({
        cols: cols
      });
    });

    areasRef.on('value', snap => {
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
        rows: rows
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
        let areaData = {};
        const { key, area } = row;
        if(!( key in updatePriceList )) {
          updatePriceList[key] = {
            rice: {
              dummy: 'dummy'
            },
            ravva: {
              dummy: 'dummy'
            },
            broken: {
              dummy: 'dummy'
            }
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
      Object.keys(row).forEach( key => {
        const value = row[key];
        const [ product, priceType ] = key.split('$');
        if(priceType) {
          if(!dbObject[product]) {
            dbObject[product] = {};
          }
          dbObject[product][priceType] = value;
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


  render() {
    const theme = {
        pressedStyle: {background: 'dark-blue', fontWeight: 'bold', fontSize: 32},
        overPressedStyle: {background: 'dark-blue', fontWeight: 'bold', fontSize: 32}
    };

    const productType = this.state.productType;

    return <div>
      <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.productType === 'rice' })}
            onClick={() => { this.changeProductType('rice'); }}>
            RICE
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.productType === 'ravva' })}
            onClick={() => { this.changeProductType('ravva'); }}>
            RAVVA
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.productType === 'broken' })}
            onClick={() => { this.changeProductType('broken'); }}>
            BROKEN
          </NavLink>
        </NavItem>
      </Nav>
      <p><span style={ {color: '#ecf2f9' } }>██ </span> is agent price. <span style={ {color: '#fff7e6' } }>██ </span> is outlet price </p>
      <p>Double click on the price to change</p>

      <ReactDataGrid
        enableCellSelect={true}
        columns={this.state.cols[productType]}
        rowGetter={this.rowGetter.bind(this)}
        rowsCount={this.state.rows[productType].length}
        onGridRowsUpdated={this.handleGridRowsUpdated.bind(this)} />
      <Button className="update-button" onClick={ this.updatePrices.bind(this) } theme={ theme } disabled={ false }><FaSave />SAVE</Button>
      <Button className="sms-button" onClick={ this.sendSMS.bind(this) } theme={ theme } disabled={ false }><FaMail />SEND SMS</Button>
    </div>

  }
}

export default PriceList;

// COLUMN DATA SAMPLE
// {
//   key: 'WG_Town',
//   name: 'WG Town',
//   width: columnWidth,
//   editable: true,
//   resizable: true
// }


// ROW DATA SAMPLE
// {
//   product: '25KgLalithaYellow',
//   vizag_city: '343.00',
//   vizag_rural: '453.00',
//   vizag_gajuwaka: '563.00',
//   vizag_anakapalli: '783.00',
//   EG_city: '123.00',
//   EG_Peddapuram: '223.00',
//   EG_Agency: '633.00',
//   WG_Town: '843.00'
// }
