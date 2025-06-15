import React from 'react';

interface MapPreviewProps {
  address: string;
}

const MapPreview: React.FC<MapPreviewProps> = ({ address }) => {
  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps?q=${encodedAddress}&t=k&z=17&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  return (
    <div className="mt-4">
      <iframe
        title="Mapa"
        src={mapSrc}
        className="w-full h-64 rounded-md border"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="text-right mt-1">
        <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          Ver rotas no Maps
        </a>
      </div>
    </div>
  );
};

export default MapPreview;
