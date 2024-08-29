import React, { useState } from 'react';

const openColors = {
  gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
  red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
  pink: ['#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595', '#e64980', '#d6336c', '#c2255c', '#a61e4d'],
  grape: ['#f8f0fc', '#f3d9fa', '#eebefa', '#e599f7', '#da77f2', '#cc5de8', '#be4bdb', '#ae3ec9', '#9c36b5', '#862e9c'],
  violet: ['#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7', '#7950f2', '#7048e8', '#6741d9', '#5f3dc4'],
  indigo: ['#edf2ff', '#dbe4ff', '#bac8ff', '#91a7ff', '#748ffc', '#5c7cfa', '#4c6ef5', '#4263eb', '#3b5bdb', '#364fc7'],
  blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
  cyan: ['#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db', '#22b8cf', '#15aabf', '#1098ad', '#0c8599', '#0b7285'],
  teal: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9', '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'],
  green: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
  lime: ['#f4fce3', '#e9fac8', '#d8f5a2', '#c0eb75', '#a9e34b', '#94d82d', '#82c91e', '#74b816', '#66a80f', '#5c940d'],
  yellow: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'],
  orange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'],
};

interface OpenColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const OpenColorPicker: React.FC<OpenColorPickerProps> = ({ value, onChange }) => {
  const [selectedHue, setSelectedHue] = useState<string | null>(null);

  const handleHueSelect = (hue: string, color: string) => {
    setSelectedHue(hue);
    onChange(color);
  };

  const handleShadeSelect = (color: string) => {
    onChange(color);
  };

  const renderColorButton = (color: string, isSpecial: boolean = false) => (
    <button
      key={color}
      className={`w-6 h-6 rounded-md ${color === value ? 'ring-2 ring-offset-2 ring-blue-500' : ''} ${
        isSpecial ? 'border border-gray-300' : ''
      }`}
      style={{ backgroundColor: color }}
      onClick={() => handleShadeSelect(color)}
    />
  );

  const renderTransparentButton = () => (
    <button
      key="transparent"
      className={`w-6 h-6 rounded-md ${value === 'transparent' ? 'ring-2 ring-offset-2 ring-blue-500' : ''} border border-gray-300`}
      style={{
        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
      }}
      onClick={() => handleShadeSelect('transparent')}
    />
  );

  return (
    <div className="w-full">
      <div className="flex space-x-1 mb-2">
        {renderTransparentButton()}
        {renderColorButton('#FFFFFF', true)}
        {renderColorButton('#000000', true)}
        {Object.entries(openColors).map(([hue, shades]) => (
          hue === 'gray' ? (
            <button
              key={hue}
              className={`w-6 h-6 rounded-md ${shades[5] === value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: shades[5] }}
              onClick={() => handleHueSelect(hue, shades[5])}
            />
          ) : null
        ))}
      </div>
      <div className="flex space-x-1 mb-2">
        {Object.entries(openColors).map(([hue, shades]) => (
          hue !== 'gray' ? (
            <button
              key={hue}
              className={`w-6 h-6 rounded-md ${shades[5] === value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: shades[5] }}
              onClick={() => handleHueSelect(hue, shades[5])}
            />
          ) : null
        ))}
      </div>
      {selectedHue && (
        <div className="flex space-x-1">
          {openColors[selectedHue as keyof typeof openColors].map((color) => renderColorButton(color))}
        </div>
      )}
    </div>
  );
};

export default OpenColorPicker;