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
            let _seriesData = [];
            for (b = 0; b < worksheetData.data.length; b++) {
                _seriesData.push(worksheetData.data[b][a].formattedValue);
            }
            // 구매 카테가 5개 미만인 경우, 강제로 라벨을 확대시키고, 빈 카테 value는 0으로 처리
            if(labels.length<5){
                console.log(labels,_seriesData);
                var tempLabels = ['가구','가전/PC','공구/자동차','반려/취미/문구','생활용품','스포츠','식품','유아','컴퓨터','태블릿/모바일/디카','패션'];
                var tempLabels2 = ['가구','가전/PC','공구/자동차','반려/취미/문구','생활용품','스포츠','식품','유아','컴퓨터','태블릿/모바일/디카','패션'];
                var tempSeriesIndex = [];
                var c=0;
                for(c=0;c<tempLabels.length;c++){
                    if(tempLabels.includes(labels[c])===true){
                        let _idx = tempLabels.indexOf(labels[c]);
                        tempLabels2[_idx]=_seriesData[c];
                        
                    }
                }
                
               console.log(tempLabels2);
            }
            mydata = {
                labels: labels,
                datasets: [{
                    label: '',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)',
                    data: _seriesData,
                    borderJoinStyle: 'round',
                }]
            };
            var config = {
                type: 'radar',
                data: mydata,
                responsive: true,
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        r: {
                            suggestedMin: -20,
                            ticks: {
                                color: 'red',
                                display: false,
                            }
                        }
                    }
                },

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