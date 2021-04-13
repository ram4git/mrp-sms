import React, { Component } from 'react';
import * as firebase from 'firebase';
import Collapse, { Panel } from 'rc-collapse-icon';
import 'rc-collapse/assets/index.css';
import Product from './Product';
import AddProduct from './AddProduct';

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rice: {},
      ravva: {},
      broken: {}
    };
  }

  componentDidMount() {
      const productsRef = firebase.database().ref().child('products');
      const brokenRef = productsRef.child('broken');
      const riceRef = productsRef.child('rice');
      const ravvaRef = productsRef.child('ravva');

      brokenRef.on('value', snap => {
        this.setState({
          broken:  snap.val()
        });
      });

      riceRef.on('value', snap => {
        this.setState({
          rice: snap.val()
        });
      });

      ravvaRef.on('value', snap => {
        this.setState({
          ravva: snap.val()
        });
      });
  }

  getProducts(productType) {
    const productsArray = this.state ? this.state[productType] : {};
    const products = [];
    Object.keys(productsArray).forEach( productKey => {
      products.push(
        <Panel header={ productsArray[productKey].name } key={ productKey } className="product-panel" showArrow="true">
          <Product productKey={ productKey } productType={ productType }/>
        </Panel>
      );
    });
    return products;
  }

  render() {
    return (
      <div>
        <Collapse >
          <Panel header="Add a new Product" key="new-product" className="add-panel" showArrow="false">
            <AddProduct />
          </Panel>
        </Collapse>

        <Collapse>
          <Panel header="Wheat" key="rice">
            <Collapse>
              { this.getProducts('rice') }
            </Collapse>
          </Panel>
        </Collapse>


        <Collapse>
          <Panel header="Paddy" key="ravva">
            <Collapse>
              { this.getProducts('ravva') }
            </Collapse>
          </Panel>
        </Collapse>

        <Collapse>
          <Panel header="Rice/Broken" key="broken">
            <Collapse>
              { this.getProducts('broken') }
            </Collapse>
          </Panel>
        </Collapse>

      </div>
    );

  }
}

export default Products;
