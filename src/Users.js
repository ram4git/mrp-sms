import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';
import * as firebase from 'firebase';
import {Link} from 'react-router';
import { Button } from 'semantic-ui-react';
import FaAgent from 'react-icons/lib/fa/group';
import FaUserDisabled from 'react-icons/lib/fa/user-times';
import FaUserActive from 'react-icons/lib/fa/user';
import FaOutlet from 'react-icons/lib/fa/cart-arrow-down';
import './Orders.css';

const { Toolbar, Filters: { NumericFilter, AutoCompleteFilter }, Data: { Selectors } } = require('react-data-grid-addons');

class StatusColorFormatter extends Component {
  constructor(props) {
    super(props);
    this.colorMap = {
      'AGENT': '#ccccff',
      'OUTLET': '#ffebcc',
      'ACTIVATED': '#9fdf9f',
      'DISABLED': '#ffb399'
    };

    this.iconMap = {
      'AGENT': <FaAgent />,
      'OUTLET': <FaOutlet />,
      'ACTIVATED': <FaUserActive />,
      'DISABLED': <FaUserDisabled />
    };
  }
  render() {
    return (
      <div style={this.getStatusColor()}>
        { this.getIcon() }
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

  getIcon() {
    return this.iconMap[this.props.value];
  }
}


class UserLinkFormatter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Link to={`/agent/${this.props.value}`}>{ this.props.value }</Link>
      </div>
    );
  }
}


class Users extends Component {

  constructor(props) {
    super(props);

    const db = firebase.database();

    this.data = {
      dbRef: db.ref(),
    }

    let _defaultRows = [];
    this._columns = [
      {
        key: 'userId',
        name: 'USER ID',
        resizable: true,
        sortable: true,
        width: 200,
        filterable:true,
        locked: true,
        formatter: UserLinkFormatter
      },
      {
        key: 'userName',
        name: 'User',
        resizable: true,
        sortable: true,
        width: 200,
        filterable:true
      },
      {
        key: 'mobile',
        name: 'MOBILE',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
      },
      {
        key: 'isActive',
        name: 'ACTIVE?',
        resizable: true,
        sortable: true,
        filterable:true,
        minWidth: 200,
        formatter: StatusColorFormatter
      },
      {
        key: 'address',
        name: 'ADDRESS',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
      },
      {
        key: 'email',
        name: 'EMAIL',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true
      },
      {
        key: 'isAgent',
        name: 'AGENT?',
        resizable: true,
        sortable: true,
        minWidth: 200,
        filterable:true,
        formatter: StatusColorFormatter
      }

    ];
    this.defaultState = {
      rows: _defaultRows,
      filters: {}
    };


    this.state = {
      ...this.defaultState
    };
  }

  componentDidMount() {
    const that = this;
    const usersRef = this.data.dbRef.child('agents');
    usersRef.on('value', snapshot => {
      let tablerows = [];
      let users = snapshot.val();
      for(let key in users){
        let user = users[key];
        tablerows.unshift( {
          userId: key,
          userName: user.name,
          isActive: user.active ? 'ACTIVATED' : 'DISABLED',
          address: user.address,
          email:user.email,
          isAgent: user.isAgent ? 'AGENT' : 'PARTY',
          mobile:user.mobile
        });
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

  render() {
    return (
      <div tabTitle="Users" className="orders">
        <Link to="/new-user" className="newUserLink">Create new agent</Link>
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

export default Users;
