import { useEffect, useRef } from "react";
import {
  Viewer,
  Cartesian3,
  Color,
  LabelStyle,
  VerticalOrigin,
  Cartesian2,
  HeightReference,
  defined,
  Ion,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  createOsmBuildingsAsync,
  ScreenSpaceEventType,
  ImageryLayer,
  createWorldImageryAsync,
  UrlTemplateImageryProvider,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import { colorFor } from "../lib/aqi";
import type { StationReading } from "../lib/types";


const DELHI = Cartesian3.fromDegrees(77.20, 28.61, 35000); // Zoomed out a bit more for heatmap visibility


interface Props {
  stations: Record<string, StationReading>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CesiumTwin({ stations, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const entityMapRef = useRef<Record<string, any>>({});
  const imageryLayersRef = useRef<ImageryLayer[]>([]);

  // Boot the viewer once
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
    if (token) Ion.defaultAccessToken = token;

    const initViewer = async () => {
      const useIon = !!token;
      
      const viewer = new Viewer(containerRef.current!, {
        terrainProvider: useIon
          ? await createWorldTerrainAsync()
          : new EllipsoidTerrainProvider(),
        baseLayerPicker: false,
        navigationHelpButton: false,
        homeButton: false,
        sceneModePicker: false,
        geocoder: false,
        timeline: false,
        animation: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        baseLayer: new ImageryLayer(
          new UrlTemplateImageryProvider({
            url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            credit: "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
          })
        ),
      });

      viewer.scene.globe.enableLighting = false;
      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
      viewer.scene.fog.enabled = false;
      (viewer.scene.globe as any).baseColor = Color.fromCssColorString("#050505");
      viewer.scene.backgroundColor = Color.TRANSPARENT; // Allows our CSS background through

      // Fly to India center
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(78.9629, 22.5937, 3000000.0),
        orientation: { heading: 0.3, pitch: -0.85, roll: 0 },
      });

      if (useIon) {
        try {
          const buildings = await createOsmBuildingsAsync();
          // monochrome buildings
          buildings.style = new (window as any).Cesium.Cesium3DTileStyle({
            color: "color('#222222', 0.5)"
          });
          viewer.scene.primitives.add(buildings);
        } catch (e) {
          console.warn("OSM buildings failed:", e);
        }
      }

      viewer.screenSpaceEventHandler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);
        if (defined(picked) && picked.id && picked.id.stationId) {
          onSelect(picked.id.stationId);
        } else {
          onSelect(null);
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;
    };

    initViewer().catch(console.error);
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
      entityMapRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync station entities on each stations change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    for (const reading of Object.values(stations)) {
      const existing = entityMapRef.current[reading.station_id];
      const color = Color.fromCssColorString(colorFor(reading.aqi));
      const position = Cartesian3.fromDegrees(reading.lng, reading.lat, 60);
      const isSelected = selectedId === reading.station_id;
      const isHotspot = reading.aqi > 300;

      // Adjust ellipse size based on AQI to create a heatmap effect
      const radius = 2000.0 + (reading.aqi * 10);

      if (existing) {
        existing.position = position;
        existing.point.color = color;
        existing.point.pixelSize = isSelected ? 8 : 4;
        existing.point.outlineColor = isSelected ? Color.WHITE : Color.TRANSPARENT;
        
        if (existing.ellipse) {
          existing.ellipse.semiMinorAxis = radius;
          existing.ellipse.semiMajorAxis = radius;
          existing.ellipse.material = color.withAlpha(0.2 + (reading.aqi / 1000));
        }

        existing.label.text = `[${reading.station_id.split("-").pop()}]\nAQI ${reading.aqi}`;
        existing.label.fillColor = color;
      } else {
        const entity = viewer.entities.add({
          name: reading.station_name,
          position,
          point: {
            color,
            pixelSize: isSelected ? 8 : 4,
            outlineColor: isSelected ? Color.WHITE : Color.TRANSPARENT,
            outlineWidth: 2,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          },
          ellipse: {
            semiMinorAxis: radius,
            semiMajorAxis: radius,
            material: color.withAlpha(0.2 + (reading.aqi / 1000)),
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
          label: {
            text: `[${reading.station_id.split("-").pop()}]\nAQI ${reading.aqi}`,
            font: "10px monospace",
            fillColor: color,
            outlineColor: Color.BLACK,
            outlineWidth: 4,
            style: LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian2(0, -10),
            showBackground: false,
          },
        });
        (entity as any).stationId = reading.station_id;
        entityMapRef.current[reading.station_id] = entity;
      }
    }
  }, [stations, selectedId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-transparent"
    />
  );
}
