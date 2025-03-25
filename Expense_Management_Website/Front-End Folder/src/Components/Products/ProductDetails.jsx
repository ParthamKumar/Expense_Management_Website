import React from 'react';
import './ProductDetails.css';

const ProductDetails = ({ transactions }) => {
  // Sample data structure for multiple transactions
  const sampleTransactions = [
    {
      date: '2024-03-20',
      party: 'ABC Traders',
      broker: 'John Doe',
      truckNo: 'MH-01-AB-1234',
      jins: 'Wheat',
      bags: 100,
      bagsRate: 50,
      perKgBags: 50,
      rate: 2000,
      weight: 5000,
      diffKathoti: 50,
      netWeight: 4950,
      amount: 990000,
      bardanaAmount: 5000,
      totalAmount: 995000,
      kharch: 1500,
      extra: 500,
      netAmount: 996000
    },
    {
      date: '2024-03-21',
      party: 'XYZ Suppliers',
      broker: 'Jane Smith',
      truckNo: 'GJ-05-CC-5678',
      jins: 'Rice',
      bags: 150,
      bagsRate: 55,
      perKgBags: 50,
      rate: 2200,
      weight: 7500,
      diffKathoti: 75,
      netWeight: 7425,
      amount: 1_633_500,
      bardanaAmount: 7500,
      totalAmount: 1_641_000,
      kharch: 2000,
      extra: 1000,
      netAmount: 1_642_000
    }
  ];

  const data = transactions?.length ? transactions : sampleTransactions;

  return (
    <div className="product-details-container">
      <h2>Product Transaction Details</h2>
      
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Party</th>
              <th>Broker</th>
              <th>Truck No</th>
              <th>Jins</th>
              <th>Bags</th>
              <th>Bags Rate</th>
              <th>Per Kg</th>
              <th>Rate</th>
              <th>Weight</th>
              <th>Diff/Kath</th>
              <th>Net Wt.</th>
              <th>Amount</th>
              <th>Bardana</th>
              <th>Total</th>
              <th>Kharch</th>
              <th>+Extra</th>
              <th>Net Amt.</th>
            </tr>
          </thead>
          <tbody>
            {data.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>
                <td>{transaction.party}</td>
                <td>{transaction.broker}</td>
                <td>{transaction.truckNo}</td>
                <td>{transaction.jins}</td>
                <td className="number">{transaction.bags}</td>
                <td className="number">₹{transaction.bagsRate}</td>
                <td className="number">{transaction.perKgBags}kg</td>
                <td className="number">₹{transaction.rate}</td>
                <td className="number">{transaction.weight}kg</td>
                <td className="number">{transaction.diffKathoti}kg</td>
                <td className="number">{transaction.netWeight}kg</td>
                <td className="number">₹{transaction.amount.toLocaleString()}</td>
                <td className="number">₹{transaction.bardanaAmount.toLocaleString()}</td>
                <td className="number">₹{transaction.totalAmount.toLocaleString()}</td>
                <td className="number">₹{transaction.kharch.toLocaleString()}</td>
                <td className="number">₹{transaction.extra.toLocaleString()}</td>
                <td className="number total">₹{transaction.netAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetails;