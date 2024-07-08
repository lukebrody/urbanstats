import React from 'react';

export { Map, MapGeneric };

import { shape_link, article_link } from "../navigation/links";
import { relationship_key } from "./related-button.js";
import { random_color } from "../utils/color.js";

import "./map.css";
import { is_historical_cd } from '../utils/is_historical';
import { loadProtobuf } from '../load_json';
import { GeoJSON2SVG } from 'geojson2svg';

class MapGeneric extends React.Component {
    constructor(props) {
        super(props);
        this.polygon_by_name = {};
        this.delta = 0.25;
        this.version = 0;
        this.last_modified = new Date(0);
        this.basemap_layer = null;
        this.basemap_props = null;
    }

    render() {
        return (
            <div id={this.props.id} className="map" style={{ background: "#fff8f0", height: this.props.height || 400 }}>
                {/* place this on the right of the map */}
                <div style={
                    {zIndex: 1000, position: "absolute", right: 0, top: 0, padding: "1em"}
                }>
                    {this.buttons()}
                </div>
            </div>
        );
    }

    buttons() {
        return <></>
    }

    async compute_polygons() {
        /**
         * Should return [names, styles, zoom_index]
         * names: list of names of polygons to draw
         * styles: list of styles for each polygon
         * metas: list of metadata dictionaries for each polygon
         * zoom_index: index of polygon to zoom to, or -1 if none 
         */
        throw "compute_polygons not implemented";
    }

    async mapDidRender() {
        /**
         * Called after the map is rendered
         */
    }

    async loadShape(name) {
        return await loadProtobuf(shape_link(name), "Feature")
    }

    async componentDidMount() {
        const map = new L.Map(this.props.id, {
            layers: [], center: new L.LatLng(0, 0), zoom: 0,
            zoomSnap: this.delta, zoomDelta: this.delta, wheelPxPerZoomLevel: 60 / this.delta
        });
        this.map = map;
        await this.componentDidUpdate();
    }

    /**
     * Export the map as an svg, without the background
     *
     * @returns string svg
     */
    async exportAsSvg() {
        const [names, styles, _1, _2] = await this.compute_polygons();
        const map_bounds = this.map.getBounds();
        const bounds = {
            left: map_bounds.getWest(),
            right: map_bounds.getEast(),
            top: map_bounds.getNorth(),
            bottom: map_bounds.getSouth(),
        }
        const width = 1000;
        const height = width * (bounds.top - bounds.bottom) / (bounds.right - bounds.left);
        const converter = new GeoJSON2SVG({
            mapExtent: bounds, attributes: [{
                property: 'style',
                type: 'dynamic',
                key: 'style'
            }],
            viewportSize: {
                width: width,
                height: height,
            },
        });

        function toSvgStyle(style) {
            let svg_style = "";
            for (var key in style) {
                if (key == "fillColor") {
                    svg_style += `fill:${style[key]};`;
                    continue;
                } else if (key == "fillOpacity") {
                    svg_style += `fill-opacity:${style[key]};`;
                    continue;
                } else if (key == "color") {
                    svg_style += `stroke:${style[key]};`;
                    continue;
                } else if (key == "weight") {
                    svg_style += `stroke-width:${style[key] / 10};`;
                    continue;
                }
                svg_style += `${key}:${style[key]};`;
            }
            return svg_style;
        }

        const overall_svg = [];

        for (let i = 0; i < names.length; i++) {
            const geojson = await this.polygon_geojson(names[i]);
            const svg = converter.convert(geojson, { attributes: { style: toSvgStyle(styles[i]) } });
            for (let j = 0; j < svg.length; j++) {
                overall_svg.push(svg[j]);
            }
        }
        const header = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
         <!-- Created with urban stats mapper (http://www.urbanstats.org/) -->
            <svg
            width="${width}mm"
            height="${height}mm"
            viewBox="0 0 ${width} ${height}"
            version="1.1"
            id="svg1"
            xml:space="preserve"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:svg="http://www.w3.org/2000/svg">`;
        const footer = "</svg>";
        return header + overall_svg.join("") + footer;
    }

    async exportAsGeoJSON() {
        console.log("EXPORT AS GEOJSON")
        const [names, _1, metas, _3] = await this.compute_polygons();
        const geojson = {
            "type": "FeatureCollection",
            "features": [],
        };
        for (let i = 0; i < names.length; i++) {
            var feature = await this.polygon_geojson(names[i]);
            feature = JSON.parse(JSON.stringify(feature));
            for (let key in metas[i]) {
                feature.properties[key] = metas[i][key];
            }
            geojson.features.push(feature);
        }
        return JSON.stringify(geojson);
    }

    async componentDidUpdate() {
        await this.updateToVersion(this.version + 1);
    }

    async updateToVersion(version) {
        if (version <= this.version) {
            return;
        }
        // check if at least 1s has passed since last update
        const now = new Date();
        const delta = now - this.last_modified;
        if (delta < 1000) {
            setTimeout(() => this.updateToVersion(version), 1000 - delta);
            return;
        }
        this.version = version;
        this.last_modified = now;
        await this.updateFn();
    }

    async updateFn() {
        const map = this.map;
        this.exist_this_time = [];

        this.attachBasemap();

        const [names, styles, _, zoom_index] = await this.compute_polygons();

        await this.add_polygons(map, names, styles, zoom_index);

        await this.mapDidRender();

        // Remove polygons that no longer exist
        for (let name in this.polygon_by_name) {
            if (!this.exist_this_time.includes(name)) {
                map.removeLayer(this.polygon_by_name[name]);
                delete this.polygon_by_name[name];
            }
        }
    }

    attachBasemap() {
        if (JSON.stringify(this.props.basemap) == JSON.stringify(this.basemap_props)) {
            return;
        }
        this.basemap_props = this.props.basemap;
        if (this.basemap_layer != null) {
            this.map.removeLayer(this.basemap_layer);
            this.basemap_layer = null;
        }
        if (this.props.basemap.type == "none") {
            return;
        }
        const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        this.basemap_layer = L.tileLayer(osmUrl, { maxZoom: 20, attribution: osmAttrib });
        this.map.addLayer(this.basemap_layer);
    }

    async add_polygons(map, names, styles, zoom_to) {
        for (let i = 0; i < names.length; i++) {
            await this.add_polygon(map, names[i], i == zoom_to, styles[i]);
        }
    }

    async polygon_geojson(name) {
        // https://stackoverflow.com/a/35970894/1549476
        let poly = await this.loadShape(name);
        if (poly.geometry == "multipolygon") {
            const polys = poly.multipolygon.polygons;
            const coords = polys.map(
                poly => poly.rings.map(
                    ring => ring.coords.map(
                        coordinate => [coordinate.lon, coordinate.lat]
                    )
                )
            );
            poly = {
                "type": "MultiPolygon",
                "coordinates": coords,
            }
        } else if (poly.geometry == "polygon") {
            const coords = poly.polygon.rings.map(
                ring => ring.coords.map(
                    coordinate => [coordinate.lon, coordinate.lat]
                )
            );
            poly = {
                "type": "Polygon",
                "coordinates": coords,
            }
        } else {
            throw "unknown shape type";
        }
        let geojson = {
            "type": "Feature",
            "properties": {},
            "geometry": poly,
        }
        return geojson;
    }

    async add_polygon(map, name, fit_bounds, style, add_callback = true, add_to_bottom = false) {
        const self = this;
        this.exist_this_time.push(name);
        if (name in this.polygon_by_name) {
            this.polygon_by_name[name].setStyle(style);
            return;
        }
        let geojson = await this.polygon_geojson(name);
        // geojson.properties.id = name;
        let group = new L.featureGroup();
        let polygon = L.geoJson(geojson, { style: style, smoothFactor: 0.1, className: "tag-" + name.replace(/ /g, "_")});
        if (add_callback) {
            polygon = polygon.on("click", function (e) {
                window.location.href = article_link(self.props.universe, name);
            });
        }

        group.addLayer(polygon, add_to_bottom);
        if (fit_bounds) {
            map.fitBounds(group.getBounds(), { "animate": false });
        }
        map.addLayer(group);
        this.polygon_by_name[name] = group;
    }

    zoom_to_all() {
        // zoom such that all polygons are visible
        const map = this.map;
        const bounds = new L.LatLngBounds();
        for (let name in this.polygon_by_name) {
            bounds.extend(this.polygon_by_name[name].getBounds());
        }
        map.fitBounds(bounds);
    }

    zoom_to(name) {
        // zoom to a specific polygon
        console.log("zoom to", name);
        const map = this.map;
        map.fitBounds(this.polygon_by_name[name].getBounds());
    }
}

class Map extends MapGeneric {
    constructor(props) {
        super(props);

        this.already_fit_bounds = false;
    }

    async compute_polygons() {
        const relateds = [];
        relateds.push(...this.get_related("contained_by"));
        relateds.push(...this.get_related("intersects"));
        relateds.push(...this.get_related("borders"));
        relateds.push(...this.get_related("contains"));

        const names = [];
        const styles = [];

        names.push(this.props.longname);
        styles.push({ "interactive": false , "fillOpacity": 0.5, "weight": 1, "color": "#5a7dc3", "fillColor": "#5a7dc3" });

        const [related_names, related_styles] = this.related_polygons(relateds);
        names.push(...related_names);
        styles.push(...related_styles);

        const zoom_index = this.already_fit_bounds != this.props.longname ? 0 : -1;

        const metas = names.map((x) => { return {} });

        return [names, styles, metas, zoom_index];
    }

    async mapDidRender() {
        this.already_fit_bounds = this.props.longname;
    }

    get_related(key) {
        if (this.props.related === undefined) {
            return [];
        }
        const element = this.props.related.filter(
            (x) => x.relationshipType == key)
            .map((x) => x.buttons)[0];
        return element;
    }

    related_polygons(related) {
        const names = [];
        const styles = [];
        for (let i = related.length - 1; i >= 0; i--) {
            if (!this.props.settings.show_historical_cds && is_historical_cd(related[i].rowType)) {
                continue;
            }
            let key = relationship_key(this.props.article_type, related[i].rowType);
            if (!this.props.settings[key]) {
                continue;
            }


            const color = random_color(related[i].longname);
            const style = { color: color, weight: 1, fillColor: color, fillOpacity: 0.1 };
            names.push(related[i].longname);
            styles.push(style);
        }
        return [names, styles];
    }

}