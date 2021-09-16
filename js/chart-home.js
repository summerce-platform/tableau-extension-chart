"use strict";


(function () {
    const defaultIntervalInMin = "5";
    let activeDatasourceIdList = [];
    const ctx = document.getElementById('chart');
    var labels = [];
    var mydata;
    var myChart;
    let unregisterSettingsEventListener = null;

    $(document).ready(function () {
        $("#configureBtn").on("click", function () {
            configure();
        });
        tableau.extensions.initializeAsync({
            configure: configure
        }).then(function () {
            if (tableau.extensions.settings.get("sendDataKey") != null) {
                var sendData2 = JSON.parse(tableau.extensions.settings.get("sendDataKey"));

                render(sendData2);
                // We add our Settings and Parameter listeners here  listener here.
                unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
                    console.log("setting changed")
                    myChart.destroy();
                    labels = [];
                    render(sendData2);
                });
                // parameter change시, 바뀐 parameter 값에 의해 차트 reload
                tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
                    console.log("parameter changed!")
                    parameters.forEach(function (p) {
                        p.addEventListener(tableau.TableauEventType.ParameterChanged, (filterEvent) => {
                            myChart.destroy();
                            labels = [];
                            render(sendData2);
                        });
                    });
                });
            }
        });
    });

    function configure() {
        const popupUrl = `https://summerce-platform.github.io/tableau-extension-chart/chart-dialog.html`;
        tableau.extensions.ui
            .displayDialogAsync(popupUrl, defaultIntervalInMin, {
                height: 730,
                width: 470
            })
            .then((closePayload) => {
                $("#inactive").hide();
                $("#active").show();
                console.log("활성화됨")
                console.log("senddata", tableau.extensions.settings.get("sendDataKey"));
                var sendData = JSON.parse(tableau.extensions.settings.get("sendDataKey"));
                render(sendData);
            })
            .catch((error) => {
                switch (error.errorCode) {
                    case tableau.ErrorCodes.DialogClosedByUser:
                        console.log("Dialog was closed by user");
                        break;
                    default:
                        console.error(error.message);
                }
            });
    }
    // function getDataAjax(arrs) {
    //     return $.ajax({
    //         type: "POST",
    //         // url: `https://test.ninecube.kr/makeshop/users/idToMobile`,
    //         url: `https://ninecube.kr/makeshop/users/idToMobile`,
    //         contentType: "application/json",
    //         data: JSON.stringify(arrs),
    //     });
    // }
    // var receiversList;
    var fiveArr;

    function render(sendData) {
        $("#inactive").hide();
        $("#active").show();
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        // Find a specific worksheet
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === sendData.sheetname;
        });

        return worksheet.getSummaryDataAsync().then(function (sumdata) {
            const worksheetData = sumdata;
            console.log(worksheetData);

            var a = 0;
            var i = 0;

            for (i = 0; i < worksheetData.columns.length; i++) {
                if (worksheetData.columns[i].fieldName == sendData.colname) {
                    console.log(`${sendData.colname}의 인덱스`, i);
                    console.log(worksheetData.columns[i]);
                    break;
                }
            }
            for (a = 0; a < worksheetData.columns.length; a++) {
                if (worksheetData.columns[a].fieldName == sendData.valueName) {
                    console.log("valueName 컬럼명은", a);
                    console.log(worksheetData.columns[a]);
                    break;
                }
            }
            var b = 0;
            var k = 0;
            fiveArr = [];
            let _tempCateData = [];
            for (k = 0; k < worksheetData.data.length; k++) {
                labels.push(worksheetData.data[k][i].formattedValue);
            }

            // fiveArr = new Set(fiveArr);
            // fiveArr = [...fiveArr];
            let _tempSeriesData = [];
            for (b = 0; b < worksheetData.data.length; b++) {
                _tempSeriesData.push(worksheetData.data[b][a].formattedValue);
            }

            // Change default options for ALL charts
            Chart.helpers.merge(Chart.defaults.global.plugins.datalabels, {
                opacity: 1,
                color: 'white',
                borderColor: '#11469e',
                borderWidth: 2,
                borderRadius: 100,
                font: {
                    weight: 'bold',
                    size: 14,
                    lineHeight: 1 /* align v center */
                },
                padding: {
                    top: 5
                },
                /* hover styling */
                backgroundColor: function (context) {
                    return context.hovered ? context.dataset.borderColor : 'white';
                },
                color: function (context) {
                    return context.hovered ? 'white' : context.dataset.borderColor;
                },
                listeners: {
                    enter: function (context) {
                        context.hovered = true;
                        return true;
                    },
                    leave: function (context) {
                        context.hovered = false;
                        return true;
                    }
                }
            });

            Chart.scaleService.updateScaleDefaults('radar', {
                ticks: {
                    min: 0
                }
            });


            var options = {
                responsive: true,
                tooltips: false,
                title: {
                  text: 'chartjs-plugin-datalabels - basic example',
                  display: true,
                  position: `bottom`,
                },
                plugins: {
                  /* ######### https://chartjs-plugin-datalabels.netlify.com/ #########*/
                  datalabels: {
                    /* formatter */
                    formatter: function(value, context) {
                      return context.chart.data.labels[context.value];
                    }
                  }
                },
                /* scale: https://www.chartjs.org/docs/latest/axes/radial/linear.html#axis-range-settings */
                scale: {
                  angleLines: {
                    display: true
                  },
                  pointLabels:{
                    /* https://www.chartjs.org/docs/latest/axes/radial/linear.html#point-label-options */
                    fontSize: 15,
                    fontColor: 'black',
                    fontStyle: 'bold',
                    callback: function(value, index, values) {
                      return value;
                    }
                  },
                  ticks: {
                    /* https://www.chartjs.org/docs/latest/axes/styling.html#tick-configuration */
                    /* suggestedMax and suggestedMin settings only change the data values that are used to scale the axis */
                    suggestedMin: 0,
                    suggestedMax: 100,
                    stepSize: 25, /* 25 - 50 - 75 - 100 */
                    maxTicksLimit: 11, /* Or use maximum number of ticks and gridlines to show */
                    display: false, // remove label text only,
                  }
                },
                legend: {
                  /* https://www.chartjs.org/docs/latest/configuration/legend.html */
                  labels: {
                    padding: 10,
                    fontSize: 14,
                    lineHeight: 30,
                  },
                },
              };

            mydata = {
                labels: labels,
                datasets: [{
                    label: 'USER',
                    fill: true,
                    backgroundColor: 'rgb(3, 4 ,101 ,0.3)',
                    borderColor: 'rgb(3, 4 ,101 ,0.3)',
                    pointHoverBackgroundColor: 'rgb(122, 122, 122)',
                    pointHoverBorderColor: '',
                    data: _tempSeriesData,
                    borderJoinStyle: 'round',
                }]
            };
            var config = {
                type: 'radar',
                data: mydata,
                options: options
            };
            myChart = new Chart(
                document.getElementById('chartArea'),
                config
            );

            ///테스트...

            // $("input[name='sendingList']").val(fiveArr);
            // return new Promise((resolve, reject) => {

            //     resolve(fiveArr);
            // });


        });
    }
    // $("#getdata").on("click", function () {
    //     var currentData = JSON.parse(tableau.extensions.settings.get("sendDataKey"));
    //     render(currentData).then((arr) => {
    //         console.log(arr);
    //         let target = window.open(`https://ninecube.kr/tableau-extension/msgSendModule`, "_blank");
    //         target.sendList = fiveArr;
    //     });
    // });
})();

// columns에서 userid1이라는 객체만 뽑아보기
//각각의 5번 가져오기