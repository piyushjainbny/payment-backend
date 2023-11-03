import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const PORT =process.env.PORT || 3000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: 'https://getbestpaymentterms.netlify.app', credentials: true }))

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://getbestpaymentterms.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})

const uri = process.env.DB_URL;


const con = mongoose.connect(uri)

if (con) {
  console.log('connected to database')
}

const paymentTermsSchema = new mongoose.Schema({
  sector: String,
  minDays: Number,
  maxDays: Number,
  Country: String
})

const PaymentTerms = new mongoose.model('PaymentTerm', paymentTermsSchema)

// const paymentTerm=new PaymentTerms({
//   sector:'Food and Beverage',
//   minDays:0,
//   maxDays:10,
//   Country:'Australia'
// })

// paymentTerm.save()

const regulationSchema = new mongoose.Schema({
  regulation: String,
  sector: String,
  country: String,
  penaltyAfter: Number
})



const Regulations = new mongoose.model('Regulation', regulationSchema)

// const regulation=new Regulations({
//   regulation:'Payer have to pay a penalty of 5% if the payer delays the payment by more than 30 days',
//   sector:'Textiles',
//   country:'Australia',
//   penaltyAfter:30
// })

// regulation.save()

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.post('/', async (req, res) => {
  const data = req.body
  // console.log(data)
  try {

    const receivedPaymentFromTerms = await PaymentTerms.findOne({ sector: data.paymentFromSector, Country: data.paymentFromCountry }).exec()

    const receivedPaymentToTerms = await PaymentTerms.findOne({ sector: data.paymentToSector, Country: data.paymentToCountry }).exec()

    const receivedFromRegulations = await Regulations.findOne({ sector: data.paymentFromSector, country: data.paymentFromCountry }).exec()

    const receivedToRegulations = await Regulations.findOne({ sector: data.paymentToSector, country: data.paymentToCountry }).exec()

    res.send({
      paymentFrom: data.paymentFrom,
      paymentTo: data.paymentTo,
      invoiceDate: data.invoiceDate,
      paymentFromTerms: receivedPaymentFromTerms,
      paymentToTerms: receivedPaymentToTerms,
      regulationsFrom: receivedFromRegulations,
      regulationsTo: receivedToRegulations
    })
  } catch { e => console.log(e.message) }

})



app.listen(PORT, () => {
  console.log('I am running')
})
