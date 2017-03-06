import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';
import * as firebase from 'firebase';
import {Link} from 'react-router';
import './Orders.css';

const { Toolbar, Filters: { NumericFilter, AutoCompleteFilter }, Data: { Selectors } } = require('react-data-grid-addons');

//TODO
// (1)
// Enable grouping
// http://adazzle.github.io/react-data-grid/examples.html#/grouping
// (2)
// Show time since the order
//

class StatusColorFormatter extends Component {
  constructor(props) {
    super(props);
    this.colorMap = {
      'received': '#ccccff',
      'onhold': '#ffebcc',
      'completed': '#9fdf9f',
      'cancelled': '#ffb399'
    }
  }
  render() {
    return (
      <div style={this.getStatusColor()}>
        { this.props.value }
      </div>
    );
  }

  getStatusColor() {
    return {
      backgroundColor: this.colorMap[this.props.value],
      textAlign: 'center'
    };
  }
}


class OrderLinkFormatter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Link to={`/order/${this.props.value}`}>{ this.props.value }</Link>
      </div>
    );
  }
}


class Orders extends Component {

  constructor(props) {
    super(props);

    const db = firebase.database();

    this.data = {
      dbRef: db.ref(),
    }

    let _defaultRows = [];
    this._columns = [
      {
        key: 'orderId',
        name: 'ORDER ID',
        resizable: true,
        sortable: true,
        width: 200,
        filterable:true,
        locked: true,
        formatter: OrderLinkFormatter
      },
      {
        key: 'time',
        name: 'DATE',
        resizable: true,
        sortable: true,
        width: 200,
        filterable:true
      },
      {
        key: 'userName',
        name: 'CUSTOMER NAME',
        resizable: true,
        sortable: true,
        filterable:true,
        minWidth: 200
      },
      {
        key: 'area',
        name: 'AREA',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
      },
      {
        key: 'city',
        name: 'CITY',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
      },
      {
        key: 'status',
        name: 'STATUS',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true,
        formatter: StatusColorFormatter
      },

    ];
    this.defaultState = {
      name: '',
      lastUpdated: '',
      rows: _defaultRows,
      filters: {}
    };


    this.state = {
      ...this.defaultState
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const that = this;
    const ordersRef = this.data.dbRef.child('orders');
    ordersRef.once('value').then( snapshot => {
      let tablerows = [];let orders = snapshot.val();
      for(let key in orders){
        let order = orders[key];
        let dateTime = new Date(Number(order.time));
        let formattedDate =
          dateTime.getDate() + "/" +
          dateTime.getMonth() + 1 + "/" +
          dateTime.getFullYear() + " " +
          dateTime.getHours() + ":" +
          dateTime.getMinutes() + ":" +
          dateTime.getSeconds();

        tablerows.push( {
          orderId: order.orderId,
          userName: order.userName,
          state:order.state,
          district:order.district,
          area:order.area,
          city: order.city,
          status:order.status,
          time : formattedDate
        })
      }
      that.setState({
         rows: tablerows
      })
    });
  }


  rowGetter(i) {
    return Selectors.getRows(this.state)[i];
  }

  rowsCount() {
   return Selectors.getRows(this.state).length;
  }

  handleFilterChange(filter) {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters });
  }

  getValidFilterValues(columnId) {
   let values = this.state.rows.map(r => r[columnId]);
   return values.filter((item, i, a) => { return i === a.indexOf(item); });
  }

  handleOnClearFilters() {
    this.setState({filters: {} });
  }

  handleGridSort(sortColumn, sortDirection) {
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
      }
    };

    const newRows = sortDirection === 'NONE' ? this.state.rows.slice(0) : this.state.rows.sort(comparer);
    this.setState({rows : newRows});
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div tabTitle="Orders" className="order-list">
        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter.bind(this)}
          rowsCount={this.rowsCount()}
          onGridSort={this.handleGridSort.bind(this)}
          minHeight={500}
          toolbar={<Toolbar enableFilter={true}/>}
          onAddFilter={this.handleFilterChange.bind(this)}
          getValidFilterValues={this.getValidFilterValues}
          onClearFilters={this.handleOnClearFilters}
        />
        <footer>© MRP Solutions 2017</footer>
      </div>
    );
  }
}

export default Orders;
