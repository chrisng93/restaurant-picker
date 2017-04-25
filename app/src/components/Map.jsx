import React, { Component, PropTypes as T } from 'react';
import GoogleMapReact from 'google-map-react';
import { fitBounds, meters2ScreenPixels } from 'google-map-react/utils';
import { milesToMeters, metersToMiles, milesToDegreesLatitude } from '../utils/conversionUtils';
import Marker from './Marker';

const propTypes = {
  address: T.string,
  width: T.string,
  height: T.string,
  radius: T.number,
  choices: T.array,
};

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.geocoder = typeof google === 'object' ? new google.maps.Geocoder() : null;
    this.state = {
      mapCenter: { lat: 0, lng: 0 },
      center: { lat: 0, lng: 0 },
      zoom: 12,
      error: '',
      radiusWidth: 0,
      radiusHeight: 0,
    };
    this.parseWidthHeight = this.parseWidthHeight.bind(this);
    this.setCenter = this.setCenter.bind(this);
    this.setRadius = this.setRadius.bind(this);
    this.findZoom = this.findZoom.bind(this);
    this.findBounds = this.findBounds.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    this.setCenter(this.props.address);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.address !== nextProps.address) {
      this.setState({ zoom: 15 }, () => this.setCenter(nextProps.address));
    }
    if (this.props.radius !== nextProps.radius) {
      this.setRadius(nextProps.radius, true);
    }
    if (this.props.selectedChoice !== nextProps.selectedChoice) {
      const mapCenter = {
        lat: (this.state.mapCenter.lat + nextProps.selectedChoice.get('coordinates').get('latitude')) / 2,
        lng: (this.state.mapCenter.lng + nextProps.selectedChoice.get('coordinates').get('longitude')) / 2,
      };
      const radius = parseFloat(metersToMiles(nextProps.selectedChoice.get('distance'))) / 2;
      const zoom = this.findZoom(mapCenter, radius);
      this.setState({ mapCenter, zoom });
    }
  }

  parseWidthHeight(str) {
    return parseFloat(str.split('px')[0]);
  }

  setCenter(address) {
    const { width, height } = this.props;
    if (!this.geocoder) {
      return;
    }
    this.geocoder.geocode({ address }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK) {
        return this.setState({ error: status });
      }
      const geo = results[0].geometry.viewport;
      const bounds = {
        nw: {
          lat: geo.f.b,
          lng: geo.b.b,
        },
        se: {
          lat: geo.f.f,
          lng: geo.b.f,
        },
      };
      const size = { width: this.parseWidthHeight(width), height: this.parseWidthHeight(height) };
      const { center, zoom } = fitBounds(bounds, size);
      this.setState({ center, mapCenter: center, zoom: zoom || this.state.zoom });
    });
  }

  setRadius(radius, shouldSetBounds = false) {
    let { center, zoom } = this.state;
    if (shouldSetBounds) {
      zoom = this.findZoom(center, radius);
      this.setState({ zoom });
    }
    const { lat, lng } = center;
    const { w, h } = meters2ScreenPixels(milesToMeters(radius), { lat, lng }, zoom);
    // meters2ScreenPixels is off by a ratio of 1.5
    const ratio = 1.5;
    this.setState({ radiusWidth: w * ratio, radiusHeight: h * ratio });
  }

  findZoom(center, radius) {
    if (radius <= 60) {
      if (radius <= 1) {
        return 15;
      } else if (radius <= 3) {
        return 14;
      } else if (radius <= 7) {
        return 13;
      } else if (radius <= 13) {
        return 12;
      } else if (radius <= 29) {
        return 11;
      }
      return 10;
    }
    const { width, height } = this.props;
    const bounds = this.findBounds(center, radius);
    const newBounds = fitBounds(bounds, { width: this.parseWidthHeight(width), height: this.parseWidthHeight(height) });
    return newBounds.zoom;
  }

  findBounds(location, distance) {
    const offset = 1 / milesToDegreesLatitude(distance);
    const latMax = location.lat + offset;
    const latMin = location.lat - offset;

    const lngOffset = offset * Math.cos(location.lat * 3.14 / 180);
    const lngMax = location.lng + lngOffset;
    const lngMin = location.lng - lngOffset;
    return {
      nw: {
        lat: latMax,
        lng: lngMax,
      },
      se: {
        lat: latMin,
        lng: lngMin,
      },
    }
  }

  onChange(changes) {
    if (changes.zoom === this.state.zoom) {
      return;
    }
    this.setState({ zoom: changes.zoom }, () => this.setRadius(this.props.radius))
  }

  render() {
    const { mapCenter, center, zoom, radiusWidth, radiusHeight, error } = this.state;
    const { choices, hoveredChoice, selectedChoice } = this.props;
    const centerProps = { lat: center.lat, lng: center.lng, zoom };
    console.log('center changed', center.lat, center.lng)
    const radiusProps = { lat: center.lat, lng: center.lng, width: radiusWidth, height: radiusHeight };
    return (
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.GOOGLE_API_KEY }}
        center={mapCenter}
        zoom={zoom}
        onChange={this.onChange}
      >
        <Marker type="center" {...centerProps} />
        {choices && !selectedChoice.get('id') ? choices.map(choice =>
          <Marker
            type="restaurant"
            key={choice.get('id')}
            lat={choice.get('coordinates').get('latitude')}
            lng={choice.get('coordinates').get('longitude')}
            zoom={zoom}
            selected={choice.get('id') === hoveredChoice}
          />
        ) : null}
        {selectedChoice.get('id') ?
          <Marker
            type="restaurant"
            lat={selectedChoice.get('coordinates') ? selectedChoice.get('coordinates').get('latitude') : null}
            lng={selectedChoice.get('coordinates') ? selectedChoice.get('coordinates').get('longitude') : null}
            zoom={zoom}
            selected={true}
          />
          : null}
        {!selectedChoice.get('id') ? <Marker type="radius" {...radiusProps} /> : null}
      </GoogleMapReact>
    );
  }
}

Map.propTypes = propTypes;
