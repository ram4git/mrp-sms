import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {connectProfile, logout} from './auth';
import './Site.css';
import FaOrderList from 'react-icons/lib/fa/list';
import FaLogout from 'react-icons/lib/fa/user-times';
import FaLogin from 'react-icons/lib/fa/user-plus';

class Site extends Component {
  static propTypes = {
    ...connectProfile.PropTypes,
    children: PropTypes.any
  };

  render() {
    return (
      <div>
        <div className="Site">
          <div className="Site-header">
            <h4>Lalitha Industries</h4>
          </div>
          {this.renderUserControls()}
        </div>
        <div className="Site-page">
          {this.props.children}
        </div>
      </div>

    );
  }

  renderUserControls() {
    const {profile} = this.props;

    if (profile) {
      return (
        <div className="Site-profileControls">
          <div className="menu-item">
            <a onClick={() => logout()}><h4><FaLogout />Log Out</h4></a>
          </div>
          <div className="menu-item">
            <Link to="/admin/orders"><h4><FaOrderList />Orders</h4></Link>
          </div>
        </div>
      );
    } else {
      return (
        <div className="Site-profileControls">
          <Link to="/login"><h4><FaLogin />Log In</h4></Link>
        </div>
      );
    }
  }
}

export default connectProfile(Site);
