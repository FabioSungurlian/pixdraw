function DecToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(rgb) {
    return "#" + DecToHex(rgb[0]) + DecToHex(rgb[1]) + DecToHex(rgb[2]);
}
let tdTocados = [],
    clicking = false,
    penWid = 1,
    evenWid = true,
    alt = 0.5,
    color = "#000000",
    rgb = [0, 0, 0],
    curTd,
    penFormat = [[0, 1 / 3, 0],
    [1 / 3, 1, 1 / 3],
    [0, 1 / 3, 0]],
    penFormatWid = 3,
    parsedAlt = 1;
const numOfRows = 100,
    numOfCols = 200;
function prepareTable() {
    $("body").children("table").remove();
    let preTBody = `<tbody>`;
    for (let row = 0; row < numOfRows; row++) {
        let preRow = `<tr data-row="${row}">`;
        for (let col = 0; col < numOfCols; col++) {
            preRow += `<td data-col="${col}" data-row="${row}"><div></div></td>`;
        }
        preTBody += preRow + "</tr>";
    }
    $("#body").append(
        `<table id="grid"><colgroup>${"<col/>".repeat(numOfCols)}</colgroup>${preTBody}</tbody></table>`
    );
    let $tbody = $("#grid").children("tbody");
    $("#grid").on("mouseover", "td", function () {
        if (clicking) {
            let $this = $(this);
            let row = +$this.data("row");
            let col = +$this.data("col");

            tbody = $tbody

            //let penFormat = Array(...Array(penWid + 1)).map(() => Array(penWid + 1).map(()=>0));

            let touchRows = $tbody.children("tr").slice(row - parsedAlt, row + parsedAlt + 1),
                colSlice = [col - parsedAlt, col + parsedAlt + 1];
            Array.from(touchRows).forEach((touchRow, i) => {
                let slice = $(touchRow).children("td").slice(...colSlice).toArray();
                slice.forEach((el, j) => {
                    let $el = $(el);
                    // the opacity of the previous color in this pixel.
                    let colA = penFormat[i][j];
                    if (colA > 0) {
                        let finalColor = "";
                        if (colA < 1) {
                            // The opacity of the color that was before in this pixel.
                            let altColA = 1 - colA;
                            let altCol = $el.css("background-color");
                            let altRgb = /([\d]+)(?:, )([\d]+)(?:, )([\d]+)/i.exec(altCol);
                            let resultRgb = [
                                Math.round(altRgb[1] * altColA + rgb[0] * colA),
                                Math.round(altRgb[2] * altColA + rgb[1] * colA),
                                Math.round(altRgb[3] * altColA + rgb[2] * colA)
                            ];
                            finalColor = `rgb(${resultRgb.join(", ")})`
                        } else {
                            finalColor = color;
                            
                        }
                        $el.css("background-color", finalColor);
                    }
                });
            });
        }
    });
}

$(document).ready(function () {
    prepareTable();

    let $tbody = $("#grid").find("tbody").children();
    // click derecho
    $(document).contextmenu(function (e) {
        // No queremos al original
        e.preventDefault();

        // Muesta el customizado
        $("#context-menu").finish()
            .toggle(100)
            .css({
                top: e.pageY + "px",
                left: e.pageX + "px"
            });
    });

    $(document).mousedown(function (e) {
        
        // ¿Esta clickeando fuera del menu contextual?
        if (!$(e.target).closest("#context-menu").length > 0) {
            // Escondelo y ya
            $("#context-menu").hide(100);
            e.preventDefault();
        }
        clicking = true;
    });

    $(document).mouseup((e) => {
        clicking = false;
    })
    $("#context-menu").find("#tools").children("li").mousedown(function (e) {
        let $form = $(this).closest("#context-menu");
        let $colorInput = $form.find(`[type="color"]`);
        switch ($(e.target).data("action")) {
            case "goma":
                $colorInput.data("prev-color", $colorInput.val());
                $colorInput.val("#ffffff");
                $colorInput.prop("disabled", true);

                $("#color").trigger("change");
                break;
            case "lapiz":
                if ($colorInput.val() == "#ffffff") {
                    $colorInput.val($colorInput.data("prev-color") || "#000000")
                    $("#color").trigger("change");
                }
                $colorInput.prop("disabled", false);
                break;
            case "recargar":
                if (confirm("¿Esta seguro de que quiere recargar la página?")) {
                    location.reload();
                }
                break;
        }
    });
    $("#px-width").change(function () {
        penWid = $(this).val();
        alt = penWid / 2;// division for unnecesary repetition of the operation

        penFormatWid = Math.ceil(alt) * 2 + 1;
        parsedAlt = (penFormatWid - 1) / 2;
        let penMiddle = Math.ceil(alt);
        penFormat = new Array(penFormatWid).fill(new Array(penFormatWid).fill(0));
        console.log(`previous pen format ${penFormat}, penWid: ${penWid}`);
        // penFormat is a 2D array that includes the opacity of each pixel around the pen that it can draw. the center is [alt, alt].
        
        penFormat = penFormat.map((row, i) => {
            return row.map((cell, j) => {
                let distToCenter = Math.sqrt((penMiddle - i) ** 2 + (penMiddle - j) ** 2);
                //console.log(distToCenter);
                let opacity = (distToCenter <= alt) ? 1 : (distToCenter <= alt + 1) ? 1 - (distToCenter - alt) ** 2 : 0;
                return opacity;
            });
        });

    });
    $("#color").change(function () {
        color = $(this).val();
        rgb = [
            parseInt(color.slice(1, 3), 16),
            parseInt(color.slice(3, 5), 16),
            parseInt(color.slice(5, 7), 16)
        ]
    });
});