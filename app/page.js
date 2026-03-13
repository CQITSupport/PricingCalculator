'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, ChevronDown, ChevronUp, Plus, Trash2, Share2, Download, Target, Info } from 'lucide-react';

// Format functions - defined outside component to prevent re-creation
const formatCurrency = (value) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatFullCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// InputField component - defined outside to prevent focus loss on re-render
const InputField = ({ label, value, onChange, prefix = '', suffix = '', hint = '', min = 0, max, step = 1 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && <span className="absolute right-3 top-2.5 text-gray-500 text-sm">{suffix}</span>}
    </div>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

// ResultCard component - defined outside to prevent re-creation
const ResultCard = ({ title, value, subtitle, color, icon: Icon, isPercent = false }) => (
  <div className={`p-5 rounded-xl ${color} border transition-transform hover:scale-[1.02]`}>
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={16} className="opacity-60" />}
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-1">
      {isPercent ? `${value.toFixed(1)}%` : formatCurrency(value)}
    </p>
    {!isPercent && <p className="text-sm text-gray-500 mt-1">{formatFullCurrency(value)}</p>}
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

export default function GrossMarginCalculator() {
  // Gross Profit Section State - Itemized Costs
  const [revenuePerUnit, setRevenuePerUnit] = useState(100);
  const [commissionPerUnit, setCommissionPerUnit] = useState(0);
  const [manufacturingCost, setManufacturingCost] = useState(0);
  const [shippingFulfillment, setShippingFulfillment] = useState(0);
  const [otherDirectCosts, setOtherDirectCosts] = useState(0);
  const [unitsProjected, setUnitsProjected] = useState(10000);

  // Fixed Costs Section State - Categories with Entries
  const [fixedCostsExpanded, setFixedCostsExpanded] = useState(false);
  const [targetMarginPercent, setTargetMarginPercent] = useState(50);
  const [fixedCostCategories, setFixedCostCategories] = useState([
    { id: 1, name: 'Salaries & Contracted Labor', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 2, name: 'Sales & Marketing', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 3, name: 'Insurance', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 4, name: 'Technology', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 5, name: 'Professional Services', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 6, name: 'Rent', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 7, name: 'Travel & Entertainment', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 8, name: 'R&D', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
    { id: 9, name: 'Service/Support', expanded: false, entries: [{ id: 1, description: '', amount: 0 }] },
  ]);

  // Tips Section State
  const [showTips, setShowTips] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  // Add new category
  const addCategory = () => {
    const newId = Math.max(...fixedCostCategories.map((c) => c.id), 0) + 1;
    setFixedCostCategories([...fixedCostCategories, { 
      id: newId, 
      name: '', 
      expanded: true, 
      entries: [{ id: 1, description: '', amount: 0 }] 
    }]);
  };

  // Remove category
  const removeCategory = (categoryId) => {
    if (fixedCostCategories.length > 1) {
      setFixedCostCategories(fixedCostCategories.filter((c) => c.id !== categoryId));
    }
  };

  // Update category name
  const updateCategoryName = (categoryId, name) => {
    setFixedCostCategories(
      fixedCostCategories.map((c) => (c.id === categoryId ? { ...c, name } : c))
    );
  };

  // Toggle category expanded
  const toggleCategory = (categoryId) => {
    setFixedCostCategories(
      fixedCostCategories.map((c) => (c.id === categoryId ? { ...c, expanded: !c.expanded } : c))
    );
  };

  // Add entry to category
  const addEntry = (categoryId) => {
    setFixedCostCategories(
      fixedCostCategories.map((c) => {
        if (c.id === categoryId) {
          const newEntryId = Math.max(...c.entries.map((e) => e.id), 0) + 1;
          return { ...c, entries: [...c.entries, { id: newEntryId, description: '', amount: 0 }] };
        }
        return c;
      })
    );
  };

  // Remove entry from category
  const removeEntry = (categoryId, entryId) => {
    setFixedCostCategories(
      fixedCostCategories.map((c) => {
        if (c.id === categoryId && c.entries.length > 1) {
          return { ...c, entries: c.entries.filter((e) => e.id !== entryId) };
        }
        return c;
      })
    );
  };

  // Update entry
  const updateEntry = (categoryId, entryId, field, value) => {
    setFixedCostCategories(
      fixedCostCategories.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            entries: c.entries.map((e) => (e.id === entryId ? { ...e, [field]: value } : e)),
          };
        }
        return c;
      })
    );
  };

  // Calculate category total
  const getCategoryTotal = (category) => {
    return category.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  // Calculations
  const calculations = useMemo(() => {
    const revenue = revenuePerUnit || 0;
    const commission = commissionPerUnit || 0;
    const manufacturing = manufacturingCost || 0;
    const shipping = shippingFulfillment || 0;
    const otherDirect = otherDirectCosts || 0;
    const units = unitsProjected || 0;

    // Total cost per unit (sum of all direct costs)
    const totalCostPerUnit = commission + manufacturing + shipping + otherDirect;
    
    const grossProfitPerUnit = revenue - totalCostPerUnit;
    const grossMarginPercent = revenue > 0 ? (grossProfitPerUnit / revenue) * 100 : 0;
    const totalRevenue = revenue * units;
    const totalCosts = totalCostPerUnit * units;
    const totalGrossProfit = grossProfitPerUnit * units;

    // Calculate total fixed costs from all categories and entries
    const totalFixedCosts = fixedCostCategories.reduce(
      (sum, cat) => sum + cat.entries.reduce((entrySum, e) => entrySum + (e.amount || 0), 0),
      0
    );

    const netProfit = totalGrossProfit - totalFixedCosts;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Break-even calculation
    const breakEvenUnits =
      grossProfitPerUnit > 0 ? Math.ceil(totalFixedCosts / grossProfitPerUnit) : 0;

    // Target margin pricing
    const targetMargin = targetMarginPercent || 0;
    const suggestedPrice =
      targetMargin < 100 && totalCostPerUnit > 0 ? totalCostPerUnit / (1 - targetMargin / 100) : 0;

    return {
      totalCostPerUnit,
      grossProfitPerUnit,
      grossMarginPercent,
      totalRevenue,
      totalCosts,
      totalGrossProfit,
      totalFixedCosts,
      netProfit,
      netMarginPercent,
      breakEvenUnits,
      suggestedPrice,
    };
  }, [revenuePerUnit, commissionPerUnit, manufacturingCost, shippingFulfillment, otherDirectCosts, unitsProjected, fixedCostCategories, targetMarginPercent]);

  const copyToClipboard = () => {
    const fixedCostDetails = fixedCostCategories.map(cat => {
      const categoryTotal = getCategoryTotal(cat);
      if (categoryTotal === 0 && cat.entries.every(e => !e.description)) return null;
      
      const entriesText = cat.entries
        .filter(e => e.amount > 0 || e.description)
        .map(e => `      ${e.description || 'Unnamed'}: ${formatFullCurrency(e.amount)}`)
        .join('\n');
      
      return `  ${cat.name || 'Unnamed Category'}: ${formatFullCurrency(categoryTotal)}${entriesText ? '\n' + entriesText : ''}`;
    }).filter(Boolean).join('\n');

    const text = `Gross Profit & Pricing Analysis
━━━━━━━━━━━━━━━━━━━━━━
Unit Economics:
  Revenue per Unit: ${formatFullCurrency(revenuePerUnit)}
  
  Direct Costs:
    Commission: ${formatFullCurrency(commissionPerUnit)}
    Manufacturing/Production: ${formatFullCurrency(manufacturingCost)}
    Shipping/Fulfillment: ${formatFullCurrency(shippingFulfillment)}
    Other Direct Costs: ${formatFullCurrency(otherDirectCosts)}
  Total Cost per Unit: ${formatFullCurrency(calculations.totalCostPerUnit)}
  
  Gross Profit per Unit: ${formatFullCurrency(calculations.grossProfitPerUnit)}
  Gross Margin %: ${calculations.grossMarginPercent.toFixed(1)}%

Projections (${unitsProjected.toLocaleString()} units):
  Total Revenue: ${formatFullCurrency(calculations.totalRevenue)}
  Total Direct Costs: ${formatFullCurrency(calculations.totalCosts)}
  Gross Profit: ${formatFullCurrency(calculations.totalGrossProfit)}

Fixed Costs (Operating Expenses):
${fixedCostDetails || '  No fixed costs entered'}
  ─────────────────────
  Total Fixed Costs: ${formatFullCurrency(calculations.totalFixedCosts)}

Profitability:
  Net Profit: ${formatFullCurrency(calculations.netProfit)}
  Net Margin: ${calculations.netMarginPercent.toFixed(1)}%
  Break-Even Units: ${calculations.breakEvenUnits.toLocaleString()}

Target Pricing:
  Target Margin: ${targetMarginPercent}%
  Suggested Price: ${formatFullCurrency(calculations.suggestedPrice)}`;
    
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  const generatePDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
      });
      
      const maxHeight = 20;
      const ratio = logoImg.width / logoImg.height;
      const logoHeight = maxHeight;
      const logoWidth = logoHeight * ratio;
      
      doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
      y += logoHeight + 10;
    } catch (e) {
      console.log('Logo not loaded, continuing without it');
    }
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 95);
    doc.text('Gross Profit & Pricing Analysis', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Summary boxes
    doc.setFillColor(239, 246, 255);
    doc.rect(14, y, 55, 25, 'F');
    doc.setFillColor(236, 253, 245);
    doc.rect(77, y, 55, 25, 'F');
    doc.setFillColor(255, 251, 235);
    doc.rect(140, y, 55, 25, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Gross Margin', 41, y + 7, { align: 'center' });
    doc.text('Gross Profit', 104, y + 7, { align: 'center' });
    doc.text('Net Profit', 167, y + 7, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text(`${calculations.grossMarginPercent.toFixed(1)}%`, 41, y + 18, { align: 'center' });
    doc.setTextColor(5, 150, 105);
    doc.text(formatCurrency(calculations.totalGrossProfit), 104, y + 18, { align: 'center' });
    doc.setTextColor(calculations.netProfit >= 0 ? 5 : 220, calculations.netProfit >= 0 ? 150 : 38, calculations.netProfit >= 0 ? 105 : 38);
    doc.text(formatCurrency(calculations.netProfit), 167, y + 18, { align: 'center' });
    
    y += 35;
    
    // Unit Economics
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Unit Economics', 14, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Revenue per Unit: ${formatFullCurrency(revenuePerUnit)}`, 14, y);
    y += 8;
    
    doc.text('Direct Costs:', 14, y);
    y += 6;
    doc.text(`  Commission: ${formatFullCurrency(commissionPerUnit)}`, 14, y);
    y += 5;
    doc.text(`  Manufacturing/Production: ${formatFullCurrency(manufacturingCost)}`, 14, y);
    y += 5;
    doc.text(`  Shipping/Fulfillment: ${formatFullCurrency(shippingFulfillment)}`, 14, y);
    y += 5;
    doc.text(`  Other Direct Costs: ${formatFullCurrency(otherDirectCosts)}`, 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Total Cost per Unit: ${formatFullCurrency(calculations.totalCostPerUnit)}`, 14, y);
    y += 8;
    
    doc.setTextColor(5, 150, 105);
    doc.text(`Gross Profit per Unit: ${formatFullCurrency(calculations.grossProfitPerUnit)}`, 14, y);
    y += 6;
    doc.text(`Gross Margin %: ${calculations.grossMarginPercent.toFixed(1)}%`, 14, y);
    y += 12;
    
    // Projections
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text(`Projections (${unitsProjected.toLocaleString()} units)`, 14, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Total Revenue: ${formatFullCurrency(calculations.totalRevenue)}`, 14, y);
    y += 6;
    doc.text(`Total Direct Costs: ${formatFullCurrency(calculations.totalCosts)}`, 14, y);
    y += 6;
    doc.setTextColor(5, 150, 105);
    doc.text(`Gross Profit: ${formatFullCurrency(calculations.totalGrossProfit)}`, 14, y);
    y += 12;
    
    // Fixed Costs
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Fixed Costs (Operating Expenses)', 14, y);
    y += 8;
    
    doc.setFontSize(10);
    fixedCostCategories.forEach(cat => {
      const categoryTotal = getCategoryTotal(cat);
      if (categoryTotal > 0 || cat.entries.some(e => e.description)) {
        // Category header
        doc.setTextColor(30, 58, 95);
        doc.setFont(undefined, 'bold');
        doc.text(`${cat.name || 'Unnamed Category'}: ${formatFullCurrency(categoryTotal)}`, 14, y);
        doc.setFont(undefined, 'normal');
        y += 5;
        
        // Entries
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        cat.entries.forEach(e => {
          if (e.amount > 0 || e.description) {
            doc.text(`  • ${e.description || 'Unnamed'}: ${formatFullCurrency(e.amount)}`, 18, y);
            y += 4;
          }
        });
        doc.setFontSize(10);
        y += 2;
      }
    });
    
    y += 2;
    doc.setFontSize(11);
    doc.setTextColor(217, 119, 6);
    doc.text(`Total Fixed Costs: ${formatFullCurrency(calculations.totalFixedCosts)}`, 14, y);
    y += 12;
    
    // Profitability
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Profitability Analysis', 14, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Break-Even Units: ${calculations.breakEvenUnits.toLocaleString()}`, 14, y);
    y += 6;
    doc.setTextColor(calculations.netProfit >= 0 ? 5 : 220, calculations.netProfit >= 0 ? 150 : 38, calculations.netProfit >= 0 ? 105 : 38);
    doc.text(`Net Profit: ${formatFullCurrency(calculations.netProfit)}`, 14, y);
    y += 6;
    doc.text(`Net Margin: ${calculations.netMarginPercent.toFixed(1)}%`, 14, y);
    y += 12;
    
    // Target Pricing
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Target Pricing', 14, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Target Margin: ${targetMarginPercent}%`, 14, y);
    y += 6;
    doc.text(`Suggested Price per Unit: ${formatFullCurrency(calculations.suggestedPrice)}`, 14, y);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by CQuence Health Gross Margin Calculator', pageWidth / 2, 285, { align: 'center' });
    
    doc.save('gross-margin-analysis.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="CQuence Health" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-[#065399] to-[#0da4dd] bg-clip-text text-transparent">
              Profit & Pricing Calculator
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#0da4dd]"></div>
            <span className="text-[#065399] text-sm font-medium">Revenue • Costs • Profitability</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#0da4dd]"></div>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Calculate gross profit per transaction and optimize pricing.
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid gap-4 mb-6">
          <ResultCard 
            title="Gross Margin %" 
            value={calculations.grossMarginPercent} 
            subtitle={`${formatFullCurrency(calculations.grossProfitPerUnit)} profit per unit`}
            color="bg-blue-50 border-blue-200"
            icon={Percent}
            isPercent={true}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard 
              title="Total Gross Profit" 
              value={calculations.totalGrossProfit} 
              subtitle={`from ${unitsProjected.toLocaleString()} units`} 
              color="bg-emerald-50 border-emerald-200"
              icon={DollarSign}
            />
            <ResultCard 
              title="Total Revenue" 
              value={calculations.totalRevenue} 
              subtitle={`${formatFullCurrency(revenuePerUnit)} × ${unitsProjected.toLocaleString()} units`} 
              color="bg-amber-50 border-amber-200"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={generatePDF}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Share2 size={16} />
            Copy Results
          </button>
        </div>

        {/* Section 1: Unit Economics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">1. Gross Profit per Transaction</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Enter your revenue and direct costs per unit</p>
          
          {/* Revenue */}
          <div className="mb-4">
            <InputField
              label="Revenue per Unit"
              value={revenuePerUnit}
              onChange={setRevenuePerUnit}
              prefix="$"
              hint="Price charged per unit/transaction"
            />
          </div>

          {/* Direct Costs */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Direct Costs per Unit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Commission"
                value={commissionPerUnit}
                onChange={setCommissionPerUnit}
                prefix="$"
                hint="Sales commission per unit"
              />
              <InputField
                label="Manufacturing / Production"
                value={manufacturingCost}
                onChange={setManufacturingCost}
                prefix="$"
                hint="Cost to produce one unit"
              />
              <InputField
                label="Shipping / Fulfillment"
                value={shippingFulfillment}
                onChange={setShippingFulfillment}
                prefix="$"
                hint="Delivery and handling costs"
              />
              <InputField
                label="Other Direct Costs"
                value={otherDirectCosts}
                onChange={setOtherDirectCosts}
                prefix="$"
                hint="Any other variable costs"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Cost per Unit</span>
              <span className="text-lg font-bold text-gray-900">{formatFullCurrency(calculations.totalCostPerUnit)}</span>
            </div>
          </div>

          {/* Projected Units */}
          <div className="mb-4">
            <InputField
              label="Projected Units"
              value={unitsProjected}
              onChange={setUnitsProjected}
              hint="Expected units to sell"
              step={100}
            />
          </div>

          {/* Summary */}
          <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            <strong>Gross Profit per Unit:</strong> {formatFullCurrency(revenuePerUnit)} − {formatFullCurrency(calculations.totalCostPerUnit)} = {formatFullCurrency(calculations.grossProfitPerUnit)} ({calculations.grossMarginPercent.toFixed(1)}% margin)
          </div>
        </div>

        {/* Section 2: Fixed Costs & Pricing (Collapsible) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setFixedCostsExpanded(!fixedCostsExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Target className="text-amber-600" size={20} />
              <div className="text-left">
                <h2 className="text-lg font-semibold">2. Fixed Costs & Pricing Analysis</h2>
                <p className="text-sm text-gray-500">Add fixed costs to calculate break-even and optimize pricing</p>
              </div>
            </div>
            {fixedCostsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {fixedCostsExpanded && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4">
                {/* Fixed Costs Categories */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Fixed Costs (Operating Expenses)</h3>
                  <button
                    onClick={addCategory}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {fixedCostCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-3 p-3 bg-gray-100">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {category.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategoryName(category.id, e.target.value)}
                          placeholder="Category name"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-right">
                          {formatFullCurrency(getCategoryTotal(category))}
                        </span>
                        <button
                          onClick={() => removeCategory(category.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={fixedCostCategories.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Category Entries */}
                      {category.expanded && (
                        <div className="p-3 space-y-2">
                          {category.entries.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={entry.description}
                                onChange={(e) => updateEntry(category.id, entry.id, 'description', e.target.value)}
                                placeholder="Description"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                                <input
                                  type="number"
                                  value={entry.amount}
                                  onChange={(e) => updateEntry(category.id, entry.id, 'amount', Number(e.target.value))}
                                  placeholder="0"
                                  className="w-28 pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeEntry(category.id, entry.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                disabled={category.entries.length === 1}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addEntry(category.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Plus size={14} />
                            Add Entry
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Total Fixed Costs</span>
                    <span className="text-xl font-bold text-amber-600">
                      {formatFullCurrency(calculations.totalFixedCosts)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Margin Pricing */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Target Margin Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Target Gross Margin"
                    value={targetMarginPercent}
                    onChange={setTargetMarginPercent}
                    suffix="%"
                    hint="What margin do you want to achieve?"
                    max={99}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Price per Unit</label>
                    <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-2xl font-bold text-emerald-600">
                        {calculations.suggestedPrice > 0
                          ? formatFullCurrency(calculations.suggestedPrice)
                          : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Price needed to achieve target margin</p>
                  </div>
                </div>
              </div>

              {/* Profitability Results */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Profitability Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-500 mb-1">Break-Even Units</p>
                    <p className="text-xl font-bold text-purple-600">
                      {calculations.grossProfitPerUnit > 0
                        ? calculations.breakEvenUnits.toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-gray-500 mb-1">Fixed Costs</p>
                    <p className="text-xl font-bold text-amber-600">
                      {formatCurrency(calculations.totalFixedCosts)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border ${calculations.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs text-gray-500 mb-1">Net Profit</p>
                    <p className={`text-xl font-bold ${calculations.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(calculations.netProfit)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border ${calculations.netMarginPercent >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs text-gray-500 mb-1">Net Margin %</p>
                    <p className={`text-xl font-bold ${calculations.netMarginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculations.netMarginPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Insight */}
              {unitsProjected > 0 && calculations.grossProfitPerUnit > 0 && (
                <div className={`mt-4 rounded-lg p-3 text-sm ${unitsProjected >= calculations.breakEvenUnits ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  <strong>Insight:</strong>{' '}
                  {unitsProjected >= calculations.breakEvenUnits ? (
                    <>
                      At {unitsProjected.toLocaleString()} units, you're{' '}
                      <span className="font-semibold">
                        {(unitsProjected - calculations.breakEvenUnits).toLocaleString()} units above break-even
                      </span>
                      . Your net profit is {formatFullCurrency(calculations.netProfit)} with a net margin of {calculations.netMarginPercent.toFixed(1)}%.
                    </>
                  ) : (
                    <>
                      At {unitsProjected.toLocaleString()} units, you need{' '}
                      <span className="font-semibold">
                        {(calculations.breakEvenUnits - unitsProjected).toLocaleString()} more units
                      </span>{' '}
                      to reach break-even.
                      {calculations.suggestedPrice > revenuePerUnit && targetMarginPercent > 0 && (
                        <>
                          {' '}Consider raising price to {formatFullCurrency(calculations.suggestedPrice)} to hit your {targetMarginPercent}% target margin.
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Industry Benchmarks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Industry Margin Benchmarks</h2>
            </div>
            {showBenchmarks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showBenchmarks && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Typical Gross Margins by Industry</h3>
                <div className="grid gap-2 text-sm">
                  {[
                    { industry: 'SaaS / Software', margin: '70-85%', note: 'Low marginal cost per user' },
                    { industry: 'Healthcare Services', margin: '40-60%', note: 'Labor and equipment intensive' },
                    { industry: 'Manufacturing', margin: '25-35%', note: 'Material and labor costs' },
                    { industry: 'Retail / E-commerce', margin: '20-50%', note: 'Varies by product category' },
                    { industry: 'Professional Services', margin: '50-70%', note: 'Labor-driven delivery' },
                    { industry: 'Food & Beverage', margin: '30-40%', note: 'Perishable inventory' },
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="font-medium text-gray-900">{row.industry}</span>
                        <span className="text-gray-500 text-xs ml-2">({row.note})</span>
                      </div>
                      <span className="text-emerald-600 font-medium">{row.margin}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Strategy Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li>✓ Aim for gross margins that cover fixed costs + desired profit</li>
                  <li>✓ Consider value-based pricing, not just cost-plus</li>
                  <li>✓ Factor in customer acquisition costs when setting margins</li>
                  <li>✓ Higher margins allow more room for discounting and promotions</li>
                  <li>✓ Monitor competitor pricing but don't race to the bottom</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calculator className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">How to Use This Calculator</h2>
            </div>
            {showTips ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showTips && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900">1. Start with Unit Economics</h4>
                  <p>Enter your revenue per unit (selling price) and COGS per unit (direct costs like materials, labor, and shipping). This gives you your gross margin per unit.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">2. Add Your Fixed Costs</h4>
                  <p>Expand the Fixed Costs section and add your monthly or annual overhead: rent, salaries, insurance, marketing, utilities, software subscriptions, etc.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">3. Understand Break-Even</h4>
                  <p>Break-even units tells you how many units you need to sell before you start making a profit. This is calculated as Total Fixed Costs ÷ Gross Margin per Unit.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">4. Optimize Your Pricing</h4>
                  <p>Use the Target Margin field to reverse-engineer your price. If you want a 50% margin and your COGS is $40, you need to price at $80 per unit.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8">
          <p>© CQuence Health. No data is stored or shared.</p>
          <p className="mt-2">
            Results update automatically as you edit
          </p>
        </footer>
      </div>
    </div>
  );
}
