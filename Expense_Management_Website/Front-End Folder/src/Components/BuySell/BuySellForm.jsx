import React, { useState, useEffect } from 'react';
import './BuySellForm.css';

const BuySellForm = ({ type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    party: '',
    broker: '',
    truckNo: '',
    jins: '',
    bags: '',
    bagsRate: '',
    perKgBags: '',
    rate: '',
    weight: '',
    diffKathoti: '',
    netWeight: '',
    amount: '',
    bardanaAmount: '',
    totalAmount: '',
    kharch: '',
    extra: '',
    netAmount: '',
    type: type
  });

  useEffect(() => {
    // Calculate net weight
    const weight = parseFloat(formData.weight) || 0;
    const diff = parseFloat(formData.diffKathoti) || 0;
    setFormData(prev => ({ ...prev, netWeight: (weight - diff).toFixed(2) }));
  }, [formData.weight, formData.diffKathoti]);

  useEffect(() => {
    // Calculate amount
    const bags = parseFloat(formData.bags) || 0;
    const bagsRate = parseFloat(formData.bagsRate) || 0;
    setFormData(prev => ({ ...prev, amount: (bags * bagsRate).toFixed(2) }));
  }, [formData.bags, formData.bagsRate]);

  useEffect(() => {
    // Calculate total and net amount
    const amount = parseFloat(formData.amount) || 0;
    const bardana = parseFloat(formData.bardanaAmount) || 0;
    const kharch = parseFloat(formData.kharch) || 0;
    const extra = parseFloat(formData.extra) || 0;
    
    const total = amount + bardana;
    const net = total + kharch + extra;
    
    setFormData(prev => ({
      ...prev,
      totalAmount: total.toFixed(2),
      netAmount: net.toFixed(2)
    }));
  }, [formData.amount, formData.bardanaAmount, formData.kharch, formData.extra]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className={`buy-sell-form ${type}`}>
        <div className="form-header">
          <h2>{type.toUpperCase()} FORM</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Date*</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Party Name*</label>
              <input
                type="text"
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Broker</label>
              <input
                type="text"
                name="broker"
                value={formData.broker}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Truck No</label>
              <input
                type="text"
                name="truckNo"
                value={formData.truckNo}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Jins*</label>
              <input
                type="text"
                name="jins"
                value={formData.jins}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Bags*</label>
              <input
                type="number"
                name="bags"
                value={formData.bags}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Bags Rate*</label>
              <input
                type="number"
                name="bagsRate"
                value={formData.bagsRate}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Per Kg Bags</label>
              <input
                type="number"
                name="perKgBags"
                value={formData.perKgBags}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Rate</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Weight (kg)*</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Diff/Kathoti</label>
              <input
                type="number"
                name="diffKathoti"
                value={formData.diffKathoti}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Net Weight (kg)</label>
              <input
                type="number"
                name="netWeight"
                value={formData.netWeight}
                readOnly
                className="read-only"
              />
            </div>

            <div className="input-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                readOnly
                className="read-only"
              />
            </div>

            <div className="input-group">
              <label>Bardana Amount</label>
              <input
                type="number"
                name="bardanaAmount"
                value={formData.bardanaAmount}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                readOnly
                className="read-only"
              />
            </div>

            <div className="input-group">
              <label>Kharch</label>
              <input
                type="number"
                name="kharch"
                value={formData.kharch}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>+ Extra</label>
              <input
                type="number"
                name="extra"
                value={formData.extra}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="input-group">
              <label>Net Amount</label>
              <input
                type="number"
                name="netAmount"
                value={formData.netAmount}
                readOnly
                className="read-only"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`btn submit ${type}`}>
              Confirm {type.toUpperCase()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuySellForm;