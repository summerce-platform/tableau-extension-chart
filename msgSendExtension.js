"use strict";

(function () {
    const defaultIntervalInMin = "5";
    let activeDatasourceIdList = [];
    const el = document.getElementById('chartArea');
    const chartData = {
        // == 유저 id(1명씩만 선택될 예정)
        categories: [],
        // 유저별 구매한 대카테명
        series: []
    }
    const chartOptions = {
        chart: {
            title: 'test!',
            width: 'auto',
            height: 'auto'
        },
    };
    var chart;

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
            }
        });
    });

    function configure() {
        const popupUrl = `https://summerce-platform.github.io/tableau-extension-chart/msgSendDialogExtension.html`;
        tableau.extensions.ui
            .displayDialogAsync(popupUrl, defaultIntervalInMin, {
                height: 730,
                width: 470
            })
            .then((closePayload) => {
                $("#inactive").hide();
                $("#active").show();

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
            for (k = 0; k < worksheetData.data.length; k++) {
                chartData.categories.push(worksheetData.data[k][i].formattedValue);
            }

            // fiveArr = new Set(fiveArr);
            // fiveArr = [...fiveArr];
            let _tempSeriesData = [];
            for (b = 0; b < worksheetData.data.length; b++) {
                _tempSeriesData.push(worksheetData.data[b][a].formattedValue);
            }
            chartData.series.push({
                name: 'sample',
                data: _tempSeriesData
            });
            console.log(_tempSeriesData)
            console.log(`chartData는${chartData.series}`)

            chart = toastui.Chart.radarChart({
                el,
                chartData,
                chartOptions
            });

            // $("input[name='sendingList']").val(fiveArr);
            return new Promise((resolve, reject) => {
                resolve(fiveArr);
            });
            ///아이디값을 보내서 휴대폰번호를 얻는 ajax구문 작성

            // console.log(fiveArr);
            // $("#sheetname").text(JSON.stringify(fiveArr));
            // $("#colnames").text(i + "번째");

            // $("#sheetname").text(JSON.stringify(fiveArr));
            // receiversList = [
            //     {
            //         phone: "010-5030-1826",
            //         아이디: "new1",
            //         적립금: 0,
            //     },
            // ];
        });
    }
    $("#getdata").on("click", function () {
        var currentData = JSON.parse(tableau.extensions.settings.get("sendDataKey"));
        render(currentData).then((arr) => {
            console.log(arr);
            let target = window.open(`https://ninecube.kr/tableau-extension/msgSendModule`, "_blank");
            target.sendList = fiveArr;
        });
    });
})();

// columns에서 userid1이라는 객체만 뽑아보기
//각각의 5번 가져오기
