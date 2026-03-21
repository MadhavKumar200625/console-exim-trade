"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const sources = [
  { name: "India", lat: 22.9734, lng: 78.6569, value: 70 },
  { name: "China", lat: 35.8617, lng: 104.1954, value: 30 },
];

const tabs = {
  search: [
    { name: "Berlin", lat: 52.52, lng: 13.405, value: 65 },
    { name: "Hamburg", lat: 53.5511, lng: 9.9937, value: 35 },
  ],
  all: [
    { name: "Berlin", lat: 52.52, lng: 13.405, value: 57 },
    { name: "Hamburg", lat: 53.5511, lng: 9.9937, value: 43 },
    { name: "Szczecin", lat: 53.4285, lng: 14.5528, value: 1 },
  ],
};

export default function PortAnalysis() {
  const ref = useRef();
  const svgRef = useRef();
  const zoomBehavior = useRef();
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    const width = 900;
    const height = 450;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("cursor", "grab")
      .style("user-select", "none");

    const g = svg.append("g");
    svgRef.current = svg;

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);

    d3.json("/maps/world.geojson").then((geoData) => {
      projection.fitSize([width, height], geoData);

      // 🌍 MAP
      g.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#f1f5f9")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 0.6);

      const routes = tabs[activeTab];

      // 🔥 MULTI-SOURCE ROUTES
      sources.forEach((src) => {
        routes.forEach((dest) => {
          const sourcePoint = projection([src.lng, src.lat]);
          const destPoint = projection([dest.lng, dest.lat]);

          const midX = (sourcePoint[0] + destPoint[0]) / 2;
          const midY = (sourcePoint[1] + destPoint[1]) / 2 - 80;

          const curve = `M${sourcePoint[0]},${sourcePoint[1]} 
                         Q${midX},${midY} 
                         ${destPoint[0]},${destPoint[1]}`;

          // weight = source contribution × destination share
          const weight = (src.value * dest.value) / 100;

          // Glow
          g.append("path")
            .attr("d", curve)
            .attr("fill", "none")
            .attr("stroke", "#003466")
            .attr("stroke-width", weight / 10)
            .attr("opacity", 0.08);

          // Main arc
          g.append("path")
            .attr("d", curve)
            .attr("fill", "none")
            .attr("stroke", "#003466")
            .attr("stroke-width", weight / 20)
            .attr("stroke-linecap", "round")
            .attr("opacity", 0.7);

          // 🔥 Animated flow
          const tempPath = g.append("path").attr("d", curve).attr("fill", "none");
          const length = tempPath.node().getTotalLength();

          const dot = g
            .append("circle")
            .attr("r", 2.5)
            .attr("fill", "#003466");

          function animate() {
            dot
              .transition()
              .duration(2500)
              .attrTween("transform", () => {
                return (t) => {
                  const p = tempPath.node().getPointAtLength(t * length);
                  return `translate(${p.x},${p.y})`;
                };
              })
              .on("end", animate);
          }

          animate();
        });
      });

      // 🔵 SOURCE DOTS
      sources.forEach((s) => {
        const p = projection([s.lng, s.lat]);

        g.append("circle")
          .attr("cx", p[0])
          .attr("cy", p[1])
          .attr("r", 5)
          .attr("fill", "#16a34a");
      });

      // 🔴 DESTINATION DOTS
      routes.forEach((d) => {
        const p = projection([d.lng, d.lat]);

        g.append("circle")
          .attr("cx", p[0])
          .attr("cy", p[1])
          .attr("r", 4)
          .attr("fill", "#ef4444");
      });

      // 🔥 ZOOM
      const zoom = d3
        .zoom()
        .scaleExtent([1, 6])
        .on("start", () => svg.style("cursor", "grabbing"))
        .on("zoom", (event) => g.attr("transform", event.transform))
        .on("end", () => svg.style("cursor", "grab"));

      svg.call(zoom);
      zoomBehavior.current = zoom;
    });
  }, [activeTab]);

  // CONTROLS
  const zoomIn = () => {
    svgRef.current.transition().duration(300).call(zoomBehavior.current.scaleBy, 1.5);
  };

  const zoomOut = () => {
    svgRef.current.transition().duration(300).call(zoomBehavior.current.scaleBy, 0.7);
  };

  const resetZoom = () => {
    svgRef.current.transition().duration(300).call(zoomBehavior.current.transform, d3.zoomIdentity);
  };

  return (
    <section className="w-full px-6 py-10">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#003466]">
          Port Analysis
        </h3>

        <div className="flex gap-6 text-sm mt-2">
          {["search", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 cursor-pointer ${
                activeTab === tab
                  ? "text-[#003466] border-b-2 border-[#003466]"
                  : "text-gray-400"
              }`}
            >
              {tab === "search" ? "Search Key" : "All Products"}
            </button>
          ))}
        </div>
      </div>

      
{/* SOURCE + DESTINATION BREAKDOWN */}
<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* ================= SOURCE PORTS ================= */}
  <div className="bg-white rounded-2xl shadow-md p-5">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-md font-semibold text-[#003466]">
        Source Ports
      </h4>

      <span className="text-xs text-gray-500">
        Total: {sources?.length || 1}
      </span>
    </div>

    <div className="space-y-3">
      {(sources || [{ name: "India", value: 100 }])
        .sort((a, b) => b.value - a.value)
        .map((s, i) => {
          const max = Math.max(
            ...(sources || [{ value: 100 }]).map((x) => x.value)
          );

          return (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition"
            >
              {/* Rank */}
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {i + 1}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#003466]">
                  {s.name}
                </p>

                {/* Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(s.value / max) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className="text-sm font-semibold text-green-700 w-12 text-right">
                {s.value}%
              </div>
            </div>
          );
        })}
    </div>

    {/* Insight */}
    <div className="mt-4 pt-3 border-t text-sm text-gray-500">
      Dominant Source:{" "}
      <strong className="text-green-700">
        {(sources || [{ name: "India" }])[0].name}
      </strong>
    </div>
  </div>

  {/* ================= DESTINATION PORTS ================= */}
  <div className="bg-white rounded-2xl shadow-md p-5">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-md font-semibold text-[#003466]">
        Destination Ports
      </h4>

      <span className="text-xs text-gray-500">
        Total: {tabs[activeTab].length}
      </span>
    </div>

    <div className="space-y-3">
      {tabs[activeTab]
        .sort((a, b) => b.value - a.value)
        .map((d, i) => {
          const max = Math.max(...tabs[activeTab].map((x) => x.value));

          return (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition"
            >
              {/* Rank */}
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#003466]/10 text-[#003466] text-xs font-semibold">
                {i + 1}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#003466]">
                  {d.name}
                </p>

                {/* Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#003466]"
                    style={{
                      width: `${(d.value / max) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className="text-sm font-semibold text-[#003466] w-12 text-right">
                {d.value}%
              </div>
            </div>
          );
        })}
    </div>

    {/* Insight */}
    <div className="mt-4 pt-3 border-t text-sm text-gray-500">
      Dominant Destination:{" "}
      <strong className="text-[#003466]">
        {tabs[activeTab].sort((a, b) => b.value - a.value)[0].name}
      </strong>
    </div>
  </div>
</div>
      {/* MAP */}
      <div className="relative mt-20 bg-white rounded-2xl shadow-md p-4">

        {/* CONTROLS */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button onClick={zoomIn} className="cursor-pointer bg-white shadow px-3 py-1 rounded-md hover:bg-blue-50">+</button>
          <button onClick={zoomOut} className="cursor-pointer bg-white shadow px-3 py-1 rounded-md hover:bg-blue-50">−</button>
          <button onClick={resetZoom} className="cursor-pointer bg-white shadow px-2 py-1 rounded-md text-xs hover:bg-blue-50">Reset</button>
        </div>

        <svg ref={ref} className="w-full h-[450px]" />
      </div>

      {/* 🔥 KEEP YOUR EXISTING SOURCE + DESTINATION PANELS BELOW (NO CHANGE) */}
    </section>
  );
}