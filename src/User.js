import React, { Component } from 'react';
import * as firebase from 'firebase';
import ObjectAssign from 'object-assign';
import { Table, Loader, Button, Checkbox, Icon,Header, Image, Modal} from 'semantic-ui-react';
import classNames from 'classnames';
import Collapse, { Panel } from 'rc-collapse-icon';
import FaUserDisable from 'react-icons/lib/fa/user-times';
import FaUserEnable from 'react-icons/lib/fa/user-plus';
import {FaEdit, FaTrashO} from 'react-icons/lib/fa';
import Outlet from './Outlet';
import AddOutlet from './AddOutlet';
import './User.css';
import Collapsible from 'react-collapsible';
import AddShop from './AddShop';
import DeleteShop from './DeleteShop';
import AddAllowedArea from './AddAllowedArea';
import AddParty from './AddParty';
import {Link} from 'react-router';


const LOADING = 'loading';
const ERROR = 'error';

const statusColorMap = {
  'AGENT': '#ccccff',
  'OUTLET': '#ffebcc',
  'ACTIVATED': '#9fdf9f',
  'DISABLED': '#ffb399'
}

class Items extends Component {

  createRows() {
    let rows = [];
    const items = this.props.items;
    if(items){
      let counter = 0;
      items.forEach( item => {
        if(item) {
            counter++;
            rows.push(
              <tr key={counter}>
                <th scope="row">{counter}</th>
                <td>{item.name}</td>
                <td>{item.city}</td>
                <td>{item.proprietor_name}</td>
                <td>{item.mobile}</td>
                <td>{item.areaId}</td>
                <td>{item.tin}</td>
                <td>{item.pan}</td>
              </tr>
            );
        }
      })
    }
    return rows;
  }

  render() {
    return  (
      <Table size="bordered striped sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>City</th>
            <th>Owner</th>
            <th>Mobile</th>
            <th>Area</th>
            <th>TIN</th>
            <th>PAN</th>
          </tr>
        </thead>
        <tbody>
          { this.createRows() }
        </tbody>
        </Table>
    );
  }
}


class User extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userData: {
        loading: LOADING
      },
      renderShopsTable: false,
      renderOrdersTable: false,
      renderAreasTable: false,
      renderConstituenciesTable: false,
      constituencySelected: false,
      constituencySelectedObj:{},
      expandedRows : [],
      addShop: false,
      showModal: false,
      deleteShop : false,
      showPartyModal: false,
    };
  }

  fetchUserData() {
    const userPath = `agents/${this.props.params.userId}`;
    const userRef = firebase.database().ref().child(userPath);
    userRef.on('value', snap => {
      const userData = snap.val();
      console.log('U=', userData);
      if(userData) {
        this.setState({
          userData
        });
        const partiesPath = `p/${userData.authId}/parties`;
        const partiesRef = firebase.database().ref().child(partiesPath);
        partiesRef.on('value', s => {
          const parties = s.val();
          console.log('PARTIES=', parties);
          if(parties) {
            this.setState({parties});
          }
        })
      } else {
        this.setState({
          userData: {
            loading: ERROR
          }
        });
      }
    });
  }

  fetchConstituencies() {
    const constituencyPath = `constituency`;
    const constituencyRef = firebase.database().ref().child(constituencyPath);
    constituencyRef.on('value', snap => {
      const constituencyData = snap.val();
      this.setState({
        constituencyData
      })
    })
  }

  componentDidMount() {
    this.fetchUserData();
    this.fetchConstituencies();
  }


  renderItems(items) {
    return <Items items={items} />
  }


  activateUserStatus(enable) {
    const userStatusPath = `agents/${this.props.params.userId}/active`;
    const userStatusRef = firebase.database().ref().child(userStatusPath);
    userStatusRef.set(enable, error => {
      if(error) {
        console.log("ERROR: Unable to change user activity status");
      } else {
        let userData = ObjectAssign({}, this.state.userData, {
          active: enable
        });
        this.setState({
          userData: userData
        });
        console.log("SUCCESS: Successfully changed user activity status");
      }
    })
  }

  onShopEditClick = () => {
    this.setState({
      showModal : true
    })
  }

    renderExpandedData(item, index) {
      const {userData}=this.state;
      return (
        <Table size='large' striped>
          <Table.Body>
            <Table.Row>
              <Table.Cell>SHOP NAME</Table.Cell>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>
                <Modal  onClose={this.closeModal} open={this.state.showModal}
                trigger={<FaEdit onClick={this.onShopEditClick}/>}
                centered={false}>
                <Modal.Header>Edit Shop</Modal.Header>
                <Modal.Content scrolling >
                  <AddShop mode={'edit'} editItem={item} userId={this.props.params.userId} allowedAreas={userData.allowedAreas || []} index={index}
                  closeModal={this.closeModal}/>
                </Modal.Content>
              </Modal>
              </Table.Cell>
              <Table.Cell>
                <Modal trigger={<FaTrashO  onClick={() => this.setState({deleteShop : true})} />} open={this.state.deleteShop} closeIcon>
                  <Header content='Delete Shop ?' />
                  <Modal.Content>
                    <p>
                      Are you sure you want to delete shop? If you select yes, then the shop will be deleted forever
                    </p>
                  </Modal.Content>
                  <Modal.Actions>
                    <DeleteShop closeDeleteShop={this.closeDeleteShop} index={index} userId={this.props.params.userId}/>
                  </Modal.Actions>
                </Modal>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>PROPRIETOR NAME</Table.Cell>
              <Table.Cell>{item.proprietorName}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>MOBILE</Table.Cell>
              <Table.Cell>{item.mobile}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>TIN</Table.Cell>
              <Table.Cell>{item.tin}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>GST</Table.Cell>
              <Table.Cell>{item.gst}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>AREA ID</Table.Cell>
              <Table.Cell>{item.areaId}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>AREA NAME</Table.Cell>
              <Table.Cell>{item.areaName}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Address</Table.Cell>
              <Table.Cell>{item.address}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>STREET</Table.Cell>
              <Table.Cell>{item.street}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>CITY</Table.Cell>
              <Table.Cell>{item.city}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>DISTRICT</Table.Cell>
              <Table.Cell>{item.district}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>TAX TYPE</Table.Cell>
              <Table.Cell>{item.taxType}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>STATE</Table.Cell>
              <Table.Cell>{item.state}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )
    }

  renderItem(item , index) {
    let key = item.name;
    if(item.gst && item.gst.length >0)
       key = item.gst;
       return (
         <Collapse  key={"row-expanded-" + key }>
           <Panel header={item.name}>
               {this.renderExpandedData(item, index)}
           </Panel>
         </Collapse>
       );
   }

   renderOrderItem(item) {
        return (
            <div style={{height:40, backgroundColor:'#E6E6FF', marginTop:10}}>
                <div style={{color:'#16A085', fontSize:16, marginLeft:20, marginTop:'auto', marginBottom:'auto'}}>
                  <Link to={`/order/${item}`}>{item}</Link>
                </div>
            </div>
        );
    }

    renderAreaItem(item) {
         return (
          <div className='py-2 bg-blue-600 px-6 py-2 mx-4 rounded-full text-white'>
            {item}
          </div>
         );
     }

     onConstituencySelectClick = (item, index) => {
       const {constituencySelected,constituencySelectedObj, selectedConstituenciesArr=[]}=this.state;
       constituencySelectedObj[index]=!constituencySelectedObj[index];
       if(selectedConstituenciesArr.indexOf(item) != -1) {
         selectedConstituenciesArr.splice(selectedConstituenciesArr.indexOf(item),1);
       } else {
         selectedConstituenciesArr.push(item);
       }
       this.setState({
         constituencySelectedObj,
         selectedConstituenciesArr
       })
     }

     renderConstituencyItem(item, index) {
       const { constituencySelectedObj } = this.state;
          return (
              <div key={index} onClick={() => this.onConstituencySelectClick(item,index)}
              style={constituencySelectedObj[index] ?
                      {height:40, backgroundColor:'#16A085', marginTop:10} :
                      {height:40, backgroundColor:'#E6E6FF', marginTop:10} }>
                  <div
                  style={constituencySelectedObj[index] ?
                        {color:'#fff', fontSize:16, marginLeft:20, marginTop:'auto', marginBottom:'auto'} :
                        {color:'#16A085', fontSize:16, marginLeft:20, marginTop:'auto', marginBottom:'auto'} }>
                    {item}
                  </div>
              </div>
          );
      }

     closeModal = () => {
       this.setState({
         showModal:false
       })
     }

     closePartyModal = () => {
      this.setState({
        showPartyModal:false
      })
    }

     closeAddShopModal = () => {
       this.setState({
         addShop : false
       })
     }

     closeDeleteShop = () => {
       this.setState({
         deleteShop : false
       })
     }



  renderShops() {
    const {userData = {}, renderShopsTable}=this.state;
    const {authId} = userData;

    let allItemRows = [];

       userData.shops && userData.shops.forEach((item , index)=> {
           const perItemRows = this.renderItem(item, index);
           allItemRows = allItemRows.concat(perItemRows);
       });



       return (
         <div>
           <Modal onClose={this.closeAddShopModal}
           trigger={<Button color='teal' style={{marginTop:10,marginLeft:10}} onClick={() => this.setState({addShop : true})}>Add Shop</Button>}
           centered={false} open={this.state.addShop}>
            <Modal.Header>Add Shop</Modal.Header>
            <Modal.Content>
              <AddShop userId={this.props.params.userId} allowedAreas={userData.allowedAreas || []} closeModal={this.closeAddShopModal}/>
            </Modal.Content>
          </Modal>
          <div>{allItemRows}</div>
        </div>
        );
  }

  renderOrders() {
    const {userData}=this.state;
    let allItemRows = [];
       userData.orders && userData.orders.reverse().forEach(item => {
         const perItemRows = this.renderOrderItem(item);
           allItemRows = allItemRows.concat(perItemRows);
       });

       return (
         <div>
			     <div>{allItemRows}</div>
        </div>
      );
  }

  addConstituencies(selectedConstituenciesArr) {
    console.log('add constituencies', selectedConstituenciesArr);
    console.log(this.props.params.userId);
    let constituencyRefPath=`users/${this.props.params.userId}/constituencies`;
    let constituencyRef = firebase.database().ref().child(constituencyRefPath);

    let ref=this;

    constituencyRef.transaction(function(constituencies){
              constituencies=constituencies||[];
              constituencies=selectedConstituenciesArr;
              console.log(constituencies);
              return constituencies;
    }, function(success) {
        ref.msg.success( <div className="success"><h4>Constituencies </h4>Successfully Saved</div>, {
          time: 2000,
          type: 'success',
        });
      }
     );
  }

  renderConstituencies() {
    const {constituencyData,selectedConstituenciesArr, dailyPriceData}=this.state;
    let allItemRows = [];
       constituencyData && Object.keys(constituencyData).forEach((item, index) => {
         const eachConstituency = constituencyData[item];
         const perItemRows = this.renderConstituencyItem(eachConstituency.name.toUpperCase(), index);
              allItemRows = allItemRows.concat(perItemRows)
       });
       return (
         <div>
			     <div>{allItemRows}</div>
           <Button color='teal' style={{marginTop:10,marginLeft:10}}
             onClick={this.addConstituencies.bind(this,selectedConstituenciesArr)}>
             Add Constituencies
           </Button>
        </div>
      );
  }

  renderAreas() {
    const {userData}=this.state;
    let allItemRows = [];

    userData.areas && userData.areas.forEach(item => {
      const perItemRows = this.renderAreaItem(item);
        allItemRows = allItemRows.concat(perItemRows);
    });
    return (
      <div>
        <Modal onClose={this.closeModal} open={this.state.showModal}
          trigger={<div className='pl-4'><Button color='teal'
          onClick={() => this.setState({showModal:true})}>Edit Areas</Button></div>}
          centered={true}>
          <Modal.Content>
            <AddAllowedArea
              userId={this.props.params.userId}
              closeModal={this.closeModal}
              existingAreas={userData.areas}
              />
          </Modal.Content>
        </Modal>
        <div className='flex flex-row py-4'>
          {allItemRows}
        </div>
      </div>

    )
  }

  togglePartyStatus({partyId, status}) {
    const partyStatusRef=`p/${this.state.userData.authId}/parties/${partyId}/status`;
    const partyStatus = firebase.database().ref().child(partyStatusRef);
    partyStatus.set(!status);
  }

  renderParties() {
    const {parties={}, userData} = this.state;
    const partyList = [];
    Object.keys(parties).forEach(p => {
      const {partyName, firmName, GST, mobile, addr, area, status} = parties[p];
      partyList.push(
        <Table.Row>
          <Table.Cell width={1}><a onClick={() => this.togglePartyStatus({partyId: p, status})} >{status ? '✅' : '❌'}</a></Table.Cell>
          <Table.Cell>{partyName}</Table.Cell>
          <Table.Cell>{firmName}</Table.Cell>
          <Table.Cell>{mobile}</Table.Cell>
          <Table.Cell>{area}</Table.Cell>
          <Table.Cell>{GST}</Table.Cell>
          <Table.Cell>{addr}</Table.Cell>
        </Table.Row>
      )
    });

    return (
      <div>
        <Modal onClose={this.closeModal} open={this.state.showPartyModal}
          trigger={<div className='pl-4'><Button color='teal'
          onClick={() => this.setState({showPartyModal: true})}>Add Party</Button></div>}
          centered={true}>
          <Modal.Content>
            <AddParty
              userId={this.props.params.userId}
              closeModal={this.closePartyModal}
              authId={this.state.userData.authId}
            />
          </Modal.Content>
        </Modal>
        <Table striped columns={7}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1}></Table.HeaderCell>
            <Table.HeaderCell>Party</Table.HeaderCell>
            <Table.HeaderCell>Firm</Table.HeaderCell>
            <Table.HeaderCell>mobile</Table.HeaderCell>
            <Table.HeaderCell>area</Table.HeaderCell>
            <Table.HeaderCell>GST</Table.HeaderCell>
            <Table.HeaderCell>addr</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {partyList}
      </Table>
      </div>

    )

  }

  render() {

    if(this.state.userData.loading === LOADING) {
      return <Loader />
    }

    const { active, mobile, name} = this.state.userData;
    const userStatus = active ? 'ACTIVATED' : 'DISABLED';

    if(this.state.userData.loading === ERROR) {
      return (
        <div>
          <div className="user">
            <ul style={{backgroundColor: ' #ff6666', textAlign: 'center', listStyle: 'none' }}>
              <li><h2>INVALID URL: User <strong>{userId}</strong> does not exist.</h2></li>
            </ul>
          </div>
        </div>

      );
      <h4>User does not exist</h4>
    }

    const userStatusColor = statusColorMap[userStatus];
    const userId = this.props.params.userId;
    const userActivityActionIcon  = active ? <span><FaUserDisable onClick={ this.activateUserStatus.bind(this, false) }/> </span>:  <h2><FaUserEnable onClick={this.activateUserStatus.bind(this, true)}/></h2>;

    return (
      <div>
        <div className="lg:max-w-6xl mx-auto ">
          <div className="shadow-lg rounded-lg overflow-hidden my-4 relative">
              <ul style={{backgroundColor: userStatusColor, textAlign: 'center', listStyle: 'none', padding: '16px 0' }}>
                <li><h1>{ name }</h1></li>
                <li><h2>{ userId }</h2></li>
                <li><h2>{ mobile }</h2></li>

                <li>User is <strong>{ userStatus }</strong></li>
                <div className='text-center bg-red-100 mx-auto p-6 rounded-full shadow-lg absolute top-2 right-2'>{ userActivityActionIcon }</div>
              </ul>
          </div>
          <div className="my-12 rounded-t-lg shadow-lg">
            <div className="p-4 rounded-t-lg overflow-hidden bg-green-600 mb-8">
              <h3>PARTIES</h3>
            </div>
            <div className="pb-8 pt-2">
            {this.renderParties()}
            </div>
          </div>
          <div className="my-12 rounded-t-lg shadow-lg">
            <div className="p-4 rounded-t-lg overflow-hidden bg-green-600 mb-8">
              <h3>ALLOWED AREAS</h3>
            </div>
            <div className="pb-8 pt-2">
              {this.renderAreas()}
            </div>
          </div>
        </div>
        <hr />
        <footer>© MRP Solutions 2017</footer>
      </div>
    );
  }
}

export default User;
