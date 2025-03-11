/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 75.0, "KoPercent": 25.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.69375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Mediatech Web App - HTTP Request 1"], "isController": false}, {"data": [0.75, 500, 1500, "HOME PAGE - HTTP REQUEST"], "isController": false}, {"data": [0.0, 500, 1500, "Mediatech Web App - HTTP Request 2"], "isController": false}, {"data": [1.0, 500, 1500, "HOME PAGE - HTTP REQUEST-0"], "isController": false}, {"data": [0.8, 500, 1500, "HOME PAGE - HTTP REQUEST-1"], "isController": false}, {"data": [1.0, 500, 1500, "CHANGES - HTTP Request"], "isController": false}, {"data": [1.0, 500, 1500, "CHANGES - HTTP Request-0"], "isController": false}, {"data": [1.0, 500, 1500, "CHANGES - HTTP Request-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 80, 20, 25.0, 183.18750000000003, 0, 1284, 76.5, 692.3000000000011, 997.0, 1284.0, 44.19889502762431, 601.5743698204419, 5.524861878453039], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Mediatech Web App - HTTP Request 1", 10, 10, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 14.88095238095238, 16.842796688988095, 0.0], "isController": false}, {"data": ["HOME PAGE - HTTP REQUEST", 10, 0, 0.0, 589.6, 216, 1284, 382.5, 1273.7, 1284.0, 1284.0, 6.002400960384154, 130.74038209033614, 1.4302596038415367], "isController": false}, {"data": ["Mediatech Web App - HTTP Request 2", 10, 10, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 15.105740181268883, 17.097219599697883, 0.0], "isController": false}, {"data": ["HOME PAGE - HTTP REQUEST-0", 10, 0, 0.0, 101.7, 67, 257, 73.5, 249.3, 257.0, 257.0, 6.578947368421052, 2.1073190789473686, 0.7838199013157895], "isController": false}, {"data": ["HOME PAGE - HTTP REQUEST-1", 10, 0, 0.0, 486.6, 146, 1024, 311.5, 1021.4, 1024.0, 1024.0, 7.112375533428165, 152.6389413673542, 0.84737286628734], "isController": false}, {"data": ["CHANGES - HTTP Request", 10, 0, 0.0, 143.89999999999998, 122, 162, 144.5, 161.0, 162.0, 162.0, 16.89189189189189, 532.5894742398649, 4.420924831081082], "isController": false}, {"data": ["CHANGES - HTTP Request-0", 10, 0, 0.0, 77.69999999999999, 70, 86, 80.0, 85.7, 86.0, 86.0, 19.193857965451055, 6.37296065259117, 2.5116962571976966], "isController": false}, {"data": ["CHANGES - HTTP Request-1", 10, 0, 0.0, 66.0, 49, 76, 67.5, 75.6, 76.0, 76.0, 19.569471624266143, 610.5140044031311, 2.5608488258317026], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http:// mediatech-c0h7bjatg8bwb2ex.eastus2-01.azurewebsites.net/", 20, 100.0, 25.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 80, 20, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http:// mediatech-c0h7bjatg8bwb2ex.eastus2-01.azurewebsites.net/", 20, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Mediatech Web App - HTTP Request 1", 10, 10, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http:// mediatech-c0h7bjatg8bwb2ex.eastus2-01.azurewebsites.net/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Mediatech Web App - HTTP Request 2", 10, 10, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in authority at index 7: http:// mediatech-c0h7bjatg8bwb2ex.eastus2-01.azurewebsites.net/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
