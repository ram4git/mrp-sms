import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connectProfile, logout } from './auth';
import './Site.css';
import FaOrderList from 'react-icons/lib/fa/list';
import FaLogout from 'react-icons/lib/fa/user-times';
import FaLogin from 'react-icons/lib/fa/user-plus';
import FaSettings from 'react-icons/lib/fa/cogs';
import FaUsers from 'react-icons/lib/fa/group';
import FaMoney from 'react-icons/lib/fa/money';
import FaTags from 'react-icons/lib/fa/tag';


class Site extends Component {
  static propTypes = {
    ...connectProfile.PropTypes,
    children: PropTypes.any
  };

  render() {
    return (
      <div>
        <div className="bg-green-600 flex flex-row justify-center space-between lg:max-w-6xl mx-auto shadow-2xl rounded-lg overflow-hidden">
          <div className="p-2 flex-grow-0">
            <img src="./LalithaBrand.png" alt="Lalitha Industries" height="32" className='h-16 w-auto' />
          </div>
        
          { this.renderUserControls() }
        </div>
        <div className="Site-page">
          { this.props.children }
        </div>
      </div>

    );
  }

  renderUserControls() {
    const { access_token } = window.localStorage;

    if (access_token) {
        return (
          <div className="flex-grow flex justify-center flex-row items-center">

            <div className="menu-item text-center">
              <Link className='px-2 flex flex-col justify-center items-center' to="/dailyprices"><FaTags className='m-0 p-0 text-2xl' /><p className=''>DailyPrices</p></Link>
            </div>
            <div className="menu-item text-center">
              <Link className='px-2 flex flex-col justify-center items-center' to="/dailyprice"><FaTags className='m-0 p-0 text-2xl' /><p className=''>DailyPrices History</p></Link>
            </div>
            <div className="menu-item text-center">
              <Link className='px-2 flex flex-col justify-center items-center' to="/users"><FaUsers className='m-0 p-0 text-2xl' /><p className=''>Users</p></Link>
            </div>
            <div className="menu-item text-center">
              <Link className='px-2 flex flex-col justify-center items-center' to="/orders"><FaOrderList className='m-0 p-0 text-2xl' /><p className=''>Orders</p></Link>
            </div>
            <div className="menu-item text-center">
              <Link className='px-2 flex flex-col justify-center items-center' to="/console"><FaSettings className='m-0 p-0 text-2xl' /><p className=''>Settings</p></Link>
            </div>
            <div className="menu-item text-center">
              <a onClick={() => logout()}><FaLogout className='m-0 p-0 text-2xl'/><p>Log Out</p></a>
            </div>
          </div>
        );
      // } else {
      //   return (
      //     <div className="Site-profileControls">
      //       <div className="menu-item">
      //         <a onClick={() => logout()}><h4><FaLogout />Log Out</h4></a>
      //       </div>
      //       <div className="menu-item">
      //         <Link to="/orders"><h4><FaOrderList />Orders</h4></Link>
      //       </div>
      //     </div>
      //   );
      // }
    } else {
      return (
        <div className="flex-grow">
          <Link to="/login"><h4><FaLogin />Log In</h4></Link>
        </div>
      );
    }
  }
}

export default connectProfile(Site);
