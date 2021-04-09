import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';
import * as firebase from 'firebase';
import {Link} from 'react-router';
import './Orders.css';
const { Toolbar, Filters: { NumericFilter, AutoCompleteFilter }, Data: { Selectors } } = require('react-data-grid-addons');
import moment from 'moment-es6'
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
      'dispatched': '#9fdf9f',
      'cancelled': '#ffb399',
      'pending': 'darkorange',
      'approved': 'lightgreen',
      'pending_approval': 'orange',
      paid: 'darkgreen'
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
      textAlign: 'center',
      padding: '4px',
      textTransform: 'uppercase',
      borderRadius: 8,
      padding: '2px 0.5em',
      color: 'white'
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


const DateFormatter = (p) => {
  const m = moment(p.value, 'YYYY-MM-DD HH:mm:ssA');
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <p>{m.format('DD/MMM/YY - HH:mm:ssA')}<span style={{fontSize: '0.6em', color: 'darkgray'}}>({m.fromNow()})</span></p>
    </div>
  )
}


class Orders extends Component {

  constructor(props) {
    super(props);

    const db = firebase.database();

    this.data = {
      dbRef: db.ref()
    }

    let _defaultRows = [];
    this._columns = [
      {
        key: 'id',
        name: 'ORDER ID',
        resizable: true,
        sortable: true,
        width: 200,
        filterable:true,
        locked: true,
        formatter: OrderLinkFormatter
      },
      {
        key: 'ts',
        name: 'DATE',
        resizable: true,
        sortable: true,
        filterable:true,
        formatter: DateFormatter
      },
      {
        key: 'agent',
        name: 'Agent NAME',
        resizable: true,
        sortable: true,
        filterable:true,
        minWidth: 200
      },
      {
        key: 'partyName',
        name: 'Party',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
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

  componentDidMount() {
    //code to add allowed areas

    // console.log('###################');
    // const shopsRef = this.data.dbRef.child('users');
    // shopsRef.once('value', data => {
    // //  console.log(data.val());
    //   let usersObj = data.val();
    //   let keys = Object.keys(usersObj);
    //   keys.map(k => {
    //     console.log('key = = ', k);
    //     if(usersObj[k].shops) {
    //       //console.log('value # # ',  usersObj[k].shops);
    //       let allShops = usersObj[k].shops;
    //       let allAreas=[];
    //       Object.keys(allShops).map(index => {
    //       //  console.log('shop = =', allShops[index]);
    //         allAreas.push(allShops[index].areaId);
    //       })
    //       let unique = allAreas.filter((v, i, a) => a.indexOf(v) === i);
    //     //  console.log('all unique areas = = = ', unique);
    //       let areasObj = {};
    //       unique.forEach((item,index) => {
    //       //  console.log(index, item);
    //         areasObj[index]=item;
    //       })
    //       console.log('areas = = ', areasObj);
    //       const areasRef = this.data.dbRef.child('users/' + k +   '/allowedAreas');
    //       areasRef.set(areasObj);
    //
    //
    //
    //     }
    //
    //   })
    // });

    const that = this;
    const ordersRef = this.data.dbRef.child('o');
    ordersRef.orderByChild('priority').limitToFirst(100).on('value', snapshot => {
      let tablerows = [];
      let orders = snapshot.val();
      for(let orderId in orders){
        const order = orders[orderId];
        let dateTime = new Date(Number(order.time));
        let formattedDate = dateTime.toLocaleDateString('en-IN') + ' ' + dateTime.toLocaleTimeString('en-IN');

        tablerows.unshift({...order})
      }
      that.setState({
         rows: tablerows.sort((a,b) => {return (a.priority < b.priority) ? 1 : ((b.priority < a.priority) ? -1 : 0);} )
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
      <div tabTitle="Orders" className="py-8 mx-8 mx-auto">
        <h1 className='text-3xl text-green-600 text-center mx-auto'>Purchase Orders</h1>
        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter.bind(this)}
          rowsCount={this.rowsCount()}
          onGridSort={this.handleGridSort.bind(this)}
          toolbar={<Toolbar enableFilter={true}/>}
          onAddFilter={this.handleFilterChange.bind(this)}
          getValidFilterValues={this.getValidFilterValues}
          onClearFilters={this.handleOnClearFilters}
          minHeight={this.rowsCount()*37+40}
        />
        <footer>© MRP Solutions 2017</footer>
      </div>
    );
  }
}

export default Orders;
