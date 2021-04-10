import React, { Component } from 'react';
import * as firebase from 'firebase';
import AlertContainer from 'react-alert';
import { Button, Form, Message, Divider, Dropdown } from 'semantic-ui-react'


class AddAllowedArea extends Component {
  constructor(props) {
    super(props);
    this.state={
      areasList:[],
      areaSelected:false,
      userId:props.userId,
      existingAreas:props.existingAreas,
      areaOptions: [],
    }
    this.saveArea = this.saveArea.bind(this)
  }


  componentDidMount() {
    const areasRef = firebase.database().ref().child('areas');
    areasRef.once('value', snap => {
      const areas = snap.val();
      const areaOptions = [];
      Object.keys(areas).forEach( areaId => {
        areaOptions.push({
          key: areaId,
          text: areaId,
          value: areaId
        });
      });

      this.setState({
        areaOptions
      });
    });
  }

  updateSelectedArea(e, {value}) {
    this.setState({
      areasPicked: value
    });
  }


  saveArea () {
    const areasRefPath=`agents/${this.props.userId}/areas`;;
    const areasRef = firebase.database().ref().child(areasRefPath);

    console.log('AREAS=', this.state.areasPicked);
    areasRef.set(this.state.areasPicked).then(() => {
      this.msg.success( <div className="success"><h4>Areas </h4> are Successfully Saved</div>, {
        time: 2000,
        type: 'success',
      });
    })

    this.props.closeModal();
  }

  renderAllAreas() {
    const {areasList, selectedArea, areaSelected, existingAreas}=this.state;
    let filteredAreas=areasList.length>0 && areasList.filter(val => !existingAreas.includes(val));
    let returnedAreas= filteredAreas.length>0 && filteredAreas.map((item) => {
      return (
        <div onClick={() => this.setState({selectedArea:item, areaSelected:!areaSelected})}
        style={areaSelected && selectedArea === item?
          {
          height:18,
          backgroundColor:'#16A085',
          marginTop:1
        }: {
          height:18,
          backgroundColor:'#E6E6FF',
          marginTop:1
        }}>
          <div style={{fontSize:12, textAlign:'center', color:'black'}}>{item}</div>
        </div>
      )
    })
    return (
      <div>
        {returnedAreas}
      </div>
    );
  }

  render() {

    return (
      <div className='pb-40'>
        <Form className="" as="div" success error warning>
          <AlertContainer ref={ a => this.msg = a} {...this.alertOptions} />
          <Form.Group unstackable widths={3}>
            <Form.Dropdown
              label='Areas'
              multiple
              selection
              options={this.state.areaOptions}
              placeholder='Select areas'
              width={8}
              onChange={ this.updateSelectedArea.bind(this) }
              required
              error={!this.state.areaId}
              defaultValue={this.props.existingAreas}
            />
          </Form.Group>

          <Button style={{
            marginLeft: '40%',
            marginTop:12,
            color:'#fff',
            backgroundColor: '#009C95',
            width:'22%'
          }} onClick={ this.saveArea.bind(this) } >
            Add Area
          </Button>
        </Form>
      </div>


    );
  }

}

export default AddAllowedArea;
