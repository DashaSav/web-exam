const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('shop_db', 'postgres', 'P@ssw0rd', {
  dialect: 'postgres'
});

const { Liquid } = require('liquidjs');
const engine = new Liquid();

app.use(bodyParser.urlencoded({ extended: false }));
app.engine('liquid', engine.express());
app.set('views', './views');
app.set('view engine', 'liquid');


const PLANNED = 'planned';
const BOUGHT = 'bought';
const UNAVAILABLE = 'unavailable';

// определение таблицы
const Purchase = sequelize.define('Purchase', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// маршрутизация
app.get('/', async (req, res) => {
  const purchases = await Purchase.findAll(); 

  const model = {
    planned: purchases.filter(x => x.type == PLANNED)
      .map(x => x.get({ plain: true })),
    bought: purchases.filter(x => x.type == BOUGHT)
      .map(x => x.get({ plain: true })),
    unavailable: purchases.filter(x => x.type == UNAVAILABLE)
      .map(x => x.get({ plain: true }))
  }

  res.render('home', model);
});

app.post('/create', async (req, res) => {
  const newPurchase = {
    name: req.body.purchase,
    type: PLANNED,
  }

  Purchase.create(newPurchase);
  res.redirect('/');
});

app.post('/buy/:id/', async (req, res) => {
  const id = req.params.id;

  Purchase.update(
    { type: BOUGHT },
    { where: { id: id } }
  );

  res.redirect('/');
});

app.post('/make_unavailable/:id/', async (req, res) => {
  const id = req.params.id;

  Purchase.update(
    { type: UNAVAILABLE },
    { where: { id: id } }
  );

  res.redirect('/');
});

app.post('/delete_all', async (req, res) => {
  const id = req.params.id;

  Purchase.destroy({ truncate: true });

  res.redirect('/');
});

sequelize.sync();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
