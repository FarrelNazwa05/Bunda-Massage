import React, { useState } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { Clock, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { useGooglePlace } from '../context/GooglePlaceContext';

const MapFallbackCard: React.FC<{
  title: string;
  address: string;
  mapsUrl: string;
  message?: string | null;
}> = ({ title, address, mapsUrl, message }) => (
  <div className="h-[380px] sm:h-[420px] w-full rounded-lg bg-[#e6e8e0] border border-[#cfd6ca] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-11 h-11 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center mb-3">
      <MapPin className="w-5 h-5" />
    </div>
    <p className="font-serif text-lg font-medium text-[#14231b] mb-1">
      {title}
    </p>
    <p className="text-xs sm:text-sm text-[#4a594e] max-w-md leading-relaxed mb-4">
      {address}
    </p>
    {message && (
      <p className="text-xs text-[#66766a] mb-4 max-w-sm">
        {message}
      </p>
    )}
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#163828] hover:bg-[#0f291d] text-white text-xs font-semibold tracking-wide transition-colors"
    >
      <span>Buka di Google Maps</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  </div>
);

export const LocationMap: React.FC = () => {
  const {
    position,
    displayName,
    formattedAddress,
    googleMapsUri,
    hours,
    isLoading,
    errorMessage,
    hasApiKey,
  } = useGooglePlace();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  if (!hasApiKey || errorMessage) {
    return (
      <MapFallbackCard
        title={displayName}
        address={formattedAddress}
        mapsUrl={googleMapsUri}
        message={errorMessage}
      />
    );
  }

  if (isLoading || !position) {
    return (
      <div className="h-[380px] sm:h-[420px] w-full rounded-lg bg-[#e6e8e0] border border-[#cfd6ca] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-6 h-6 text-[#163828] animate-spin mb-2.5" />
        <p className="text-xs sm:text-sm font-medium text-[#4a594e]">
          Memuat peta lokasi {displayName}...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[380px] sm:h-[420px] w-full rounded-lg overflow-hidden relative bg-[#dde0d7]">
      <GoogleMap
        defaultCenter={position}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        <AdvancedMarker
          ref={markerRef}
          position={position}
          title={displayName}
          onClick={() => setInfoOpen(true)}
        >
          <Pin
            background="#163828"
            borderColor="#0f291d"
            glyphColor="#f4f2ec"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={290}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="p-1 text-[#14231b] font-sans">
              <p className="font-serif font-semibold text-sm text-[#163828] mb-1">
                {displayName}
              </p>
              <p className="text-xs text-[#4a594e] leading-relaxed mb-2">
                {formattedAddress}
              </p>
              {hours.isFromGoogleMaps && (
                <p className="text-[11px] text-[#25573e] font-medium flex items-center gap-1.5 mb-2">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{hours.summaryLabel}</span>
                </p>
              )}
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#163828] underline hover:text-[#25573e]"
              >
                <span>Buka Rute di Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
