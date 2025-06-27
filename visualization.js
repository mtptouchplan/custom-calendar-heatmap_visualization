looker.plugins.visualizations.add({
    options: {
      color_measure_index: {
        type: 'number',
        label: 'Measure Index for Coloring',
        default: 0,
        section: 'Style'
      }
    },
  
    create: function(element, config) {
      element.innerHTML = `
        <style>
          .tooltip {
            position: absolute;
            text-align: left;
            width: auto;
            padding: 8px;
            font: 12px sans-serif;
            background: rgba(0,0,0,0.7);
            color: #fff;
            border: 0;
            border-radius: 4px;
            pointer-events: none;
            opacity: 0;
            z-index: 100;
          }
        </style>
        <div id="calendarViz"></div>
        <div class="tooltip" id="tooltip"></div>
      `;
    },
  
    updateAsync: function(data, element, config, queryResponse, details, done) {
      if (!data || data.length === 0) {
        element.innerHTML = "No data.";
        done();
        return;
      }
  
      const viz = element.querySelector("#calendarViz");
      viz.innerHTML = "";
  
      const tooltip = element.querySelector("#tooltip");
  
      const cellSize = 17;
      const width = 960;
      const height = 136;
  
      // Simple date parser fallback for various formats
      const parseDate = d => new Date(d);
  
      const colorMeasureIndex = config.color_measure_index || 0;
  
      // Ensure there is at least one dimension and one measure
      if (!queryResponse.fields.dimensions.length || !queryResponse.fields.measures.length) {
        element.innerHTML = "Please include at least one dimension and one measure.";
        done();
        return;
      }
  
      const dateField = queryResponse.fields.dimensions[0].name;
  
      const flatData = data.map(row => {
        return {
          date: parseDate(row[dateField].value),
          measure_values: queryResponse.fields.measures.map(m => ({
            label: m.label,
            value: row[m.name].value
          }))
        };
      });
  
      // Filter out invalid dates
      const validData = flatData.filter(d => d.date instanceof Date && !isNaN(d.date));
  
      const allValues = validData.map(d => +d.measure_values[colorMeasureIndex]?.value || 0);
      const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
        .domain([d3.min(allValues), d3.max(allValues)]);
  
      const svg = d3.select(viz).append("svg")
        .attr("width", width)
        .attr("height", height + 20)
        .append("g")
        .attr("transform", "translate(40,20)");
  
      validData.forEach((d) => {
        const day = d.date.getDay();
        const week = d3.timeWeek.count(d3.timeYear(d.date), d.date);
  
        svg.append("rect")
          .attr("x", week * cellSize)
          .attr("y", day * cellSize)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("fill", colorScale(+d.measure_values[colorMeasureIndex].value || 0))
          .on("mouseover", function(event) {
            const tooltipHtml = `
              <div><strong>${d.date.toDateString()}</strong></div>
              ${d.measure_values.map(m =>
                `<div><strong>${m.label}:</strong> ${m.value}</div>`
              ).join("")}
            `;
            tooltip.innerHTML = tooltipHtml;
            tooltip.style.left = event.pageX + 10 + "px";
            tooltip.style.top = event.pageY - 28 + "px";
            tooltip.style.opacity = 1;
          })
          .on("mouseout", function() {
            tooltip.style.opacity = 0;
          });
      });
  
      done();
    }
  });
  
  