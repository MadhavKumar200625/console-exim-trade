"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import SellingPartnersTable from "./market/SellingPartnersTable";

const data = {
  India: 70,
  China: 40,
  "United States of America": 25,
  Germany: 18,
};

const countryList = Object.entries(data).map(([name, value]) => ({
  name,
  value,
}));

export default function MarketPartners() {
  const ref = useRef();
  const zoomRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    const width = 900;
    const height = 450;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f8fafc")
      .style("border-radius", "16px");

    const g = svg.append("g");

    svgRef.current = svg;
    zoomRef.current = g;

    const colorScale = d3
      .scaleLinear()
      .domain([0, 70])
      .range(["#e0f2fe", "#003466"]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("background", "#003466")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("display", "none");

    d3.json("/maps/world.geojson").then((geoData) => {
      if (!geoData || !geoData.features) return;

      const projection = d3.geoMercator();
      const path = d3.geoPath().projection(projection);

      projection.fitSize([width, height], geoData);

      // MAP
      g.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const val = data[d.properties.name];
          return val ? colorScale(val) : "#eef2f7";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
          const val = data[d.properties.name] || 0;

          tooltip
            .style("display", "block")
            .html(
              `<strong>${d.properties.name}</strong><br/>Trade: ${val}`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", event.pageY + 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseleave", () => {
          tooltip.style("display", "none");
        });

      // BUBBLES
      geoData.features.forEach((d) => {
        const val = data[d.properties.name];
        if (!val) return;

        const centroid = path.centroid(d);

        g.append("circle")
          .attr("cx", centroid[0])
          .attr("cy", centroid[1])
          .attr("r", val / 5)
          .attr("fill", "#003466")
          .attr("opacity", 0.2);

        g.append("circle")
          .attr("cx", centroid[0])
          .attr("cy", centroid[1])
          .attr("r", 3)
          .attr("fill", "#003466");
      });

      // ZOOM BEHAVIOR
      const zoom = d3
  .zoom()
  .scaleExtent([1, 6])
  .on("start", () => {
    svg.style("cursor", "grabbing");
  })
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  })
  .on("end", () => {
    svg.style("cursor", "grab");
  });

svg.call(zoom);


      // store zoom instance
      svg.node().__zoomInstance = zoom;
    });

    return () => {
      d3.selectAll(".map-tooltip").remove();
    };
  }, []);

  // 🔥 CONTROLS
  const zoomIn = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg
      .transition()
      .duration(300)
      .call(svg.node().__zoomInstance.scaleBy, 1.5);
  };

  const zoomOut = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg
      .transition()
      .duration(300)
      .call(svg.node().__zoomInstance.scaleBy, 0.7);
  };

  const resetZoom = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg
      .transition()
      .duration(300)
      .call(svg.node().__zoomInstance.transform, d3.zoomIdentity);
  };

  return (
    <section className="w-full px-6 py-10">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#003466]">
          Market & Partners
        </h3>
        <p className="text-sm text-gray-500">
          Sourcing Markets Analysis
        </p>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT PANEL */}
        <div className="bg-gradient-to-b from-[#003466]/5 to-transparent rounded-2xl p-4 shadow-inner">
          {countryList.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              className="flex items-center justify-between py-3 px-2 border-b last:border-none"
            >
              <span className="text-sm font-medium text-[#003466]">
                {c.name}
              </span>

              <span className="text-xs text-gray-500">
                {c.value}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* MAP */}
        <div className="lg:col-span-3 bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-md relative">

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={zoomIn}
              className="bg-white shadow px-3 py-1 rounded-md text-[#003466] font-semibold hover:bg-blue-50"
            >
              +
            </button>
            <button
              onClick={zoomOut}
              className="bg-white shadow px-3 py-1 rounded-md text-[#003466] font-semibold hover:bg-blue-50"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              className="bg-white shadow px-2 py-1 rounded-md text-xs text-[#003466] hover:bg-blue-50"
            >
              Reset
            </button>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003466]/10 to-transparent pointer-events-none rounded-2xl" />

          <svg ref={ref} className="w-full h-[450px]" />

          {/* LEGEND */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gradient-to-r from-[#e0f2fe] to-[#003466]" />
              <span>Low → High</span>
            </div>
          </div>
        </div>
      </div>
      <SellingPartnersTable></SellingPartnersTable>
    </section>
  );
}