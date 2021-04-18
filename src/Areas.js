import React, { Component } from 'react';
import * as firebase from 'firebase';
import Collapse, { Panel } from 'rc-collapse-icon';
import 'rc-collapse/assets/index.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaDelete from 'react-icons/lib/fa/trash-o';
import FaSave from 'react-icons/lib/fa/floppy-o';
import FaList from 'react-icons/lib/fa/list';

import FaEmptyCircle from 'react-icons/lib/fa/circle-thin';
import FaSolidCircle from 'react-icons/lib/fa/circle';
import AddArea from './AddArea';
import { Modal, Button } from 'semantic-ui-react';
import {Checkbox, CheckboxGroup} from 'react-checkbox-group';



class Areas extends Component {

  constructor(props) {
    super(props);

    this.state = {
      areas: {},
      showConfirmModal: false,
      showEditModal: false,
    };
  }

  componentDidMount() {
    const areasRef = firebase.database().ref().child('areas');
    areasRef.on('value', snap => {
      this.setState({
        areas: snap.val()
      });
    });
  }

  closeConfirmModal() {
    this.setState({ showConfirmModal: false });
  }

  openConfirmModal(areaKey, areaId) {
    this.setState({
      showConfirmModal: true,
      areaKey,
      areaId
    });
  }

  closeEditModal() {
    this.setState({
      showEditModal: false
    });
  }

  openEditModal(areaKey, areaId) {
    this.setState({
      showEditModal: true,
      areaKey,
      areaId
    });
  }

  onDeleteArea(e) {
    const { areaKey, areaId } = this.state;
    console.log("AREA TO DELETE: " + areaKey);
    const areasRef = firebase.database().ref().child('areas');
    const areaToRemoveRef = areasRef.child(areaKey);
    areaToRemoveRef.remove();
    this.closeConfirmModal();
  }

  onSaveArea(areaKey, areaId, e) {
    console.log("AREA TO EDIT: " + areaKey);

    this.closeConfirmModal();
  }


  getConfirmModal() {
    const { areaKey, areaId } = this.state;
    return <Modal show={this.state.showConfirmModal} onHide={this.closeConfirmModal.bind(this)} closeIcon>
      <Modal.Header closeButton>
        <Modal.Title>Delete { areaId } area?</Modal.Title>
      </Modal.Header>
      <Modal.Content>
        <p>Are you sure you want to delete area <bold>{ areaId }</bold>?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={this.onDeleteArea.bind(this, areaKey, areaId)}>Delete</Button>
      </Modal.Actions>
    </Modal>;
  }

  getEditModal() {
    const { areaKey, areaId } = this.state;
    if(!this.state.areas) {
      return;
    }
    const areaData = this.state.areas[areaKey];
    return <Modal  open={this.state.showEditModal} onClose={ this.closeEditModal.bind(this) } size="large" closeIcon>
      <Modal.Header closeButton>
        <Modal.Header>Edit { areaId } area?</Modal.Header>
      </Modal.Header>
      <Modal.Content scrolling image>
        <AddArea areaKey={ areaKey } mode={ 'edit' } { ...areaData } onClose={ this.closeEditModal.bind(this) } />
      </Modal.Content>
    </Modal>;
  }

  redirectToAreaDetails(areaId, areaKey) {
    const win = window.open(`areas/${areaId}`, '_blank');
    win.focus();
  }

  getAreas() {

    if(!this.state || !this.state.areas) {
      return;
    }
    const areasArray = this.state.areas;
    const areas = [];
    const self = this;

    Object.keys(this.state.areas).forEach( areaKey => {
      const { areaId, displayName, district, state, lorries, discounts={}, priority } = areasArray[areaKey];
      const areaPanelHeader = `${displayName},  ${district},  ${state} - [${areaId}]`;

      const discountsArray = [];
      Object.keys(discounts).forEach(productKey => {
        const productDiscount = discounts[productKey];
        const productDiscountsArray = [];
        productDiscount.forEach(item => {
          productDiscountsArray.push(
            <div className="item-discount">
              <strong>{item.quintals}</strong> quintals or more: <strong>₹{item.discount}</strong> discount
            </div>
          );
        });
        discountsArray.push(
          <div>
            <h4>{productKey}:</h4> {productDiscountsArray}
          </div>);
      });


      areas.push(
        <Panel header={ areaPanelHeader } key={ areaId }>
          <div className="actions">
            <div className="action" onClick={ this.openEditModal.bind(this, areaKey, areaId) }><FaEdit /></div>
            <div className="action" onClick={ this.openConfirmModal.bind(this, areaKey, areaId) }><FaDelete /></div>
            <div className="action" onClick={ this.redirectToAreaDetails.bind(this,areaKey, areaId) }><FaList /></div>
          </div>
          <div className="area">
              <ul>
                <li><label>Aread ID: </label> <span>{ areaId }</span> </li>
                <li><label>Display Name: </label> <span>{ displayName }</span></li>
                <li><label>District: </label> <span>{ district }</span></li>
                <li><label>State: </label> <span>{ state }</span></li>
                <li><label>Transport Options: </label>
                  <CheckboxGroup
                    name="lorries"
                    value={ lorries } >

                    <label className="checkGroup"><Checkbox value="3"  disabled/> 3 Ton</label>
                    <label className="checkGroup"><Checkbox value="5"  disabled/> 5 Ton</label>
                    <label className="checkGroup"><Checkbox value="7"  disabled/> 7 Ton</label>
                    <label className="checkGroup"><Checkbox value="10" disabled/>10 Ton</label>
                    <label className="checkGroup"><Checkbox value="17" disabled/>17 Ton</label>
                    <label className="checkGroup"><Checkbox value="21" disabled/>21 Ton</label>
                  </CheckboxGroup>
                </li>
                <li>
                  <label>Discounts: </label>
                    { discountsArray }
                </li>
                <li><label>Priority: </label> <span>{ priority }</span></li>
              </ul>
          </div>

        </Panel>
      );
    });
    return areas;
  }

  render() {
    const confirmModal =  this.getConfirmModal();
    const editModal =  this.getEditModal();
    return (
      <div className="agents">
        { confirmModal }
        { editModal }
        <Collapse >
          <Panel header="Add a new Area" key="new-area" className="add-area" showArrow="false">
            <AddArea />
          </Panel>
        </Collapse>

        <Collapse>
            { this.getAreas() }
        </Collapse>

      </div>
    );

  }

}

export default Areas;
