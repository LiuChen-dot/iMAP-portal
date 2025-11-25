/*!==================================================================
name: Mol2View JavaScript Library v1.0.4
website:  https://0snow.com/
copyright: 0snow.com
date: 020-07-20
//================================================================!*/

//===================================================================
// 通用部分
//===================================================================
if (!$0chem) var $0chem = {};
$0chem.chemView = function (canvas, data, width, height) {
    let countsLinePartition = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6];
    let countsLinePartition2 = [3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 6];
    let atomLinePartition = [10, 10, 10, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    let bondLinePartition = [3, 3, 3, 3, 3, 3, 3];
    let VERSION_V2000 = "V2000";
    let VERSION_V3000 = "V3000";
    let stream = {'index': 0};
    let FONT_HEIGHT = 14, BOND_LENGTH = 45, BOND_BLANK = 4, BOND_LINE_START = 10, BOND_LINE_SPACE = 7;

    //region 基本方法
    function isEmpty(v) {
        return (typeof v === 'undefined' || v === null || v === "");
    }

    function partitionLine(line, format) {
        if (isEmpty(line))
            return null;
        let result = [];
        for (let i = 0, shift = 0; i < format.length; i++) {
            let start = shift;
            shift += format[i];
            if (shift >= line.length) {
                result.push(line.substring(start).trim());
                break;
            }
            result.push(line.substring(start, shift).trim());
        }
        return result;
    }

    function readHead(line) {
        let countsLine = partitionLine(line, countsLinePartition);
        if (countsLine.length != countsLinePartition.length)
            return {};
        //获取版本
        stream.version = countsLine[countsLine.length - 1].toUpperCase();
        if (stream.version != VERSION_V2000 && stream.version != VERSION_V3000) {
            //格式容错
            let countsLine = partitionLine(line, countsLinePartition2);
            if (countsLine.length != countsLinePartition2.length)
                return {};
            //获取版本
            stream.version = countsLine[countsLine.length - 1].toUpperCase();
            if (stream.version != VERSION_V2000 && stream.version != VERSION_V3000) {
                return {};
            }
        }
        /* reader */
        stream.atomCount = parseInt(countsLine[0]);
        stream.bondCount = parseInt(countsLine[1]);
        stream.atomListCount = parseInt(countsLine[2]);
        stream.stextLinesCount = parseInt(countsLine[5]);
        return stream;
    }

    //endregion

    //region V2000
    function parseAtomLine(id, line) {
        let atomSplit = partitionLine(line, atomLinePartition);
        if (atomSplit.length < 4)
            return null;
        let atom = {'id': id, 'element': atomSplit[4]};
        atom.x = parseFloat(atomSplit[0]);
        atom.y = -parseFloat(atomSplit[1]);
        atom.z = parseFloat(atomSplit[2]);
        return atom;
    }

    function parseBondLine(id, line) {
        let bondSplit = partitionLine(line, bondLinePartition);
        if (bondSplit.length < 3)
            return null;
        let bond = {'id': id};
        bond.begin = parseInt(bondSplit[0]);
        bond.end = parseInt(bondSplit[1]);
        bond.bondType = parseInt(bondSplit[2]);
        if (bondSplit.length > 3)
            bond.bondStereo = parseInt(bondSplit[3]);
        if (bondSplit.length > 5)
            bond.bondTopology = parseInt(bondSplit[5]);
        return bond;
    }

    function readCTabV2000(data) {
        let shift = stream.index + 1;
        stream.atoms = [];
        for (let i = 0; i < stream.atomCount; i++) {
            let v = parseAtomLine(i + 1, data[i + shift]);
            stream.atoms.push(v);
        }
        shift += stream.atomCount;
        stream.bonds = [];
        for (let i = 0; i < stream.bondCount; i++) {
            let v = parseBondLine(i + 1, data[i + shift]);
            stream.bonds.push(v);
        }
        shift += stream.bondCount;
        shift += stream.atomListCount;
        // //解析属性
        // ReadProperties props = ReadProperties.newInstance(stream);
        // while (shift < data.length) {
        //     String[] ctab = null;
        //     if (shift + 1 < data.length) {
        //         ctab = new String[1];
        //         ctab[0] = data[shift + 1];
        //     }
        //     ReadProperties.PropertyResult result = props.parsePropertyLines(data[shift], ctab);
        //     if (result != ReadProperties.PropertyResult.Success) {
        //         break;
        //     }
        //     shift++;
        // }
        stream.state = true;
        return stream;
    }

    //endregion

    //region V3000

    //endregion

    //region 分子绘图
    function getElement(ele) {
        switch (ele.toLowerCase()) {
            case "h":
                return {"id": 1, "symbol": "H", "fontColor": "#061eea"};
            case "he":
                return {"id": 2, "symbol": "He", "fontColor": "#d9ffff"};
            case "li":
                return {"id": 3, "symbol": "Li", "fontColor": "#cc80ff"};
            case "be":
                return {"id": 4, "symbol": "Be", "fontColor": "#c2ff00"};
            case "b":
                return {"id": 5, "symbol": "B", "fontColor": "#ffb5b5"};
            case "c":
                return {"id": 6, "symbol": "C", "fontColor": "#000000"};
            case "n":
                return {"id": 7, "symbol": "N", "fontColor": "#304ff7"};
            case "o":
                return {"id": 8, "symbol": "O", "fontColor": "#ff0d0d"};
            case "f":
                return {"id": 9, "symbol": "F", "fontColor": "#8fe04f"};
            case "ne":
                return {"id": 10, "symbol": "Ne", "fontColor": "#b3e3f5"};
            case "na":
                return {"id": 11, "symbol": "Na", "fontColor": "#ab5cf2"};
            case "mg":
                return {"id": 12, "symbol": "Mg", "fontColor": "#8aff00"};
            case "al":
                return {"id": 13, "symbol": "Al", "fontColor": "#bfa6a6"};
            case "si":
                return {"id": 14, "symbol": "Si", "fontColor": "#f0c7a1"};
            case "p":
                return {"id": 15, "symbol": "P", "fontColor": "#ff8000"};
            case "s":
                return {"id": 16, "symbol": "S", "fontColor": "#d9a61a"};
            case "cl":
                return {"id": 17, "symbol": "Cl", "fontColor": "#1ff01f"};
            case "ar":
                return {"id": 18, "symbol": "Ar", "fontColor": "#80d1e3"};
            case "k":
                return {"id": 19, "symbol": "K", "fontColor": "#8f40d4"};
            case "ca":
                return {"id": 20, "symbol": "Ca", "fontColor": "#3dff00"};
            case "sc":
                return {"id": 21, "symbol": "Sc", "fontColor": "#e6e6e6"};
            case "ti":
                return {"id": 22, "symbol": "Ti", "fontColor": "#bfc2c7"};
            case "v":
                return {"id": 23, "symbol": "V", "fontColor": "#a6a6ab"};
            case "cr":
                return {"id": 24, "symbol": "Cr", "fontColor": "#8a99c7"};
            case "mn":
                return {"id": 25, "symbol": "Mn", "fontColor": "#9c7ac7"};
            case "fe":
                return {"id": 26, "symbol": "Fe", "fontColor": "#e06633"};
            case "co":
                return {"id": 27, "symbol": "Co", "fontColor": "#f08fa1"};
            case "ni":
                return {"id": 28, "symbol": "Ni", "fontColor": "#4fd14f"};
            case "cu":
                return {"id": 29, "symbol": "Cu", "fontColor": "#c78033"};
            case "zn":
                return {"id": 30, "symbol": "Zn", "fontColor": "#7d80b0"};
            case "ga":
                return {"id": 31, "symbol": "Ga", "fontColor": "#c28f8f"};
            case "ge":
                return {"id": 32, "symbol": "Ge", "fontColor": "#668f8f"};
            case "as":
                return {"id": 33, "symbol": "As", "fontColor": "#bd80e3"};
            case "se":
                return {"id": 34, "symbol": "Se", "fontColor": "#ffa100"};
            case "br":
                return {"id": 35, "symbol": "Br", "fontColor": "#a62929"};
            case "kr":
                return {"id": 36, "symbol": "Kr", "fontColor": "#5cb8d1"};
            case "rb":
                return {"id": 37, "symbol": "Rb", "fontColor": "#702eb0"};
            case "sr":
                return {"id": 38, "symbol": "Sr", "fontColor": "#00ff00"};
            case "y":
                return {"id": 39, "symbol": "Y", "fontColor": "#94ffff"};
            case "zr":
                return {"id": 40, "symbol": "Zr", "fontColor": "#94e0e0"};
            case "nb":
                return {"id": 41, "symbol": "Nb", "fontColor": "#73c2c9"};
            case "mo":
                return {"id": 42, "symbol": "Mo", "fontColor": "#54b5b5"};
            case "tc":
                return {"id": 43, "symbol": "Tc", "fontColor": "#3b9e9e"};
            case "ru":
                return {"id": 44, "symbol": "Ru", "fontColor": "#248f8f"};
            case "rh":
                return {"id": 45, "symbol": "Rh", "fontColor": "#0a7d8c"};
            case "pd":
                return {"id": 46, "symbol": "Pd", "fontColor": "#006985"};
            case "ag":
                return {"id": 47, "symbol": "Ag", "fontColor": "#bfbfbf"};
            case "cd":
                return {"id": 48, "symbol": "Cd", "fontColor": "#ffd98f"};
            case "in":
                return {"id": 49, "symbol": "In", "fontColor": "#a67573"};
            case "sn":
                return {"id": 50, "symbol": "Sn", "fontColor": "#668080"};
            case "sb":
                return {"id": 51, "symbol": "Sb", "fontColor": "#9e63b5"};
            case "te":
                return {"id": 52, "symbol": "Te", "fontColor": "#d47a00"};
            case "i":
                return {"id": 53, "symbol": "I", "fontColor": "#940094"};
            case "xe":
                return {"id": 54, "symbol": "Xe", "fontColor": "#429eb0"};
            case "cs":
                return {"id": 55, "symbol": "Cs", "fontColor": "#57178f"};
            case "ba":
                return {"id": 56, "symbol": "Ba", "fontColor": "#00c900"};
            case "la":
                return {"id": 57, "symbol": "La", "fontColor": "#70d4ff"};
            case "ce":
                return {"id": 58, "symbol": "Ce", "fontColor": "#ffffc7"};
            case "pr":
                return {"id": 59, "symbol": "Pr", "fontColor": "#d9ffc7"};
            case "nd":
                return {"id": 60, "symbol": "Nd", "fontColor": "#c7ffc7"};
            case "pm":
                return {"id": 61, "symbol": "Pm", "fontColor": "#a3ffc7"};
            case "sm":
                return {"id": 62, "symbol": "Sm", "fontColor": "#8fffc7"};
            case "eu":
                return {"id": 63, "symbol": "Eu", "fontColor": "#61ffc7"};
            case "gd":
                return {"id": 64, "symbol": "Gd", "fontColor": "#45ffc7"};
            case "tb":
                return {"id": 65, "symbol": "Tb", "fontColor": "#30ffc7"};
            case "dy":
                return {"id": 66, "symbol": "Dy", "fontColor": "#1fffc7"};
            case "ho":
                return {"id": 67, "symbol": "Ho", "fontColor": "#00ff9c"};
            case "er":
                return {"id": 68, "symbol": "Er", "fontColor": "#00e675"};
            case "tm":
                return {"id": 69, "symbol": "Tm", "fontColor": "#00d452"};
            case "yb":
                return {"id": 70, "symbol": "Yb", "fontColor": "#00bf38"};
            case "lu":
                return {"id": 71, "symbol": "Lu", "fontColor": "#00ab24"};
            case "hf":
                return {"id": 72, "symbol": "Hf", "fontColor": "#4dc2ff"};
            case "ta":
                return {"id": 73, "symbol": "Ta", "fontColor": "#4da6ff"};
            case "w":
                return {"id": 74, "symbol": "W", "fontColor": "#2194d6"};
            case "re":
                return {"id": 75, "symbol": "Re", "fontColor": "#267dab"};
            case "os":
                return {"id": 76, "symbol": "Os", "fontColor": "#266696"};
            case "ir":
                return {"id": 77, "symbol": "Ir", "fontColor": "#175487"};
            case "pt":
                return {"id": 78, "symbol": "Pt", "fontColor": "#d1d1e0"};
            case "au":
                return {"id": 79, "symbol": "Au", "fontColor": "#ffd124"};
            case "hg":
                return {"id": 80, "symbol": "Hg", "fontColor": "#b8b8d1"};
            case "tl":
                return {"id": 81, "symbol": "Tl", "fontColor": "#a6544d"};
            case "pb":
                return {"id": 82, "symbol": "Pb", "fontColor": "#575961"};
            case "bi":
                return {"id": 83, "symbol": "Bi", "fontColor": "#9e4fb5"};
            case "po":
                return {"id": 84, "symbol": "Po", "fontColor": "#ab5c00"};
            case "at":
                return {"id": 85, "symbol": "At", "fontColor": "#754f45"};
            case "rn":
                return {"id": 86, "symbol": "Rn", "fontColor": "#428296"};
            case "fr":
                return {"id": 87, "symbol": "Fr", "fontColor": "#420066"};
            case "ra":
                return {"id": 88, "symbol": "Ra", "fontColor": "#007d00"};
            case "ac":
                return {"id": 89, "symbol": "Ac", "fontColor": "#70abfa"};
            case "th":
                return {"id": 90, "symbol": "Th", "fontColor": "#00baff"};
            case "pa":
                return {"id": 91, "symbol": "Pa", "fontColor": "#00a1ff"};
            case "u":
                return {"id": 92, "symbol": "U", "fontColor": "#008fff"};
            case "np":
                return {"id": 93, "symbol": "Np", "fontColor": "#0080ff"};
            case "pu":
                return {"id": 94, "symbol": "Pu", "fontColor": "#006bff"};
            case "am":
                return {"id": 95, "symbol": "Am", "fontColor": "#545cf2"};
            case "cm":
                return {"id": 96, "symbol": "Cm", "fontColor": "#785ce3"};
            case "bk":
                return {"id": 97, "symbol": "Bk", "fontColor": "#8a4fe3"};
            case "cf":
                return {"id": 98, "symbol": "Cf", "fontColor": "#a136d4"};
            case "es":
                return {"id": 99, "symbol": "Es", "fontColor": "#b31fd4"};
            case "fm":
                return {"id": 100, "symbol": "Fm", "fontColor": "#000000"};
            case "md":
                return {"id": 101, "symbol": "Md", "fontColor": "#000000"};
            case "no":
                return {"id": 102, "symbol": "No", "fontColor": "#000000"};
            case "lr":
                return {"id": 103, "symbol": "Lr", "fontColor": "#000000"};
            case "rf":
                return {"id": 104, "symbol": "Rf", "fontColor": "#000000"};
            case "ha":
                return {"id": 105, "symbol": "Ha", "fontColor": "#000000"};
            case "sg":
                return {"id": 106, "symbol": "Sg", "fontColor": "#000000"};
            case "bh":
                return {"id": 107, "symbol": "Bh", "fontColor": "#000000"};
            case "hs":
                return {"id": 108, "symbol": "Hs", "fontColor": "#000000"};
            case "mt":
                return {"id": 109, "symbol": "Mt", "fontColor": "#000000"};
            case "ds":
                return {"id": 110, "symbol": "Ds", "fontColor": "#000000"};
            case "rg":
                return {"id": 111, "symbol": "Rg", "fontColor": "#000000"};
            case "cn":
                return {"id": 112, "symbol": "Cn", "fontColor": "#000000"};
            case "nh":
                return {"id": 113, "symbol": "Nh", "fontColor": "#000000"};
            case "fl":
                return {"id": 114, "symbol": "Fl", "fontColor": "#000000"};
            case "mc":
                return {"id": 115, "symbol": "Mc", "fontColor": "#000000"};
            case "lv":
                return {"id": 116, "symbol": "Lv", "fontColor": "#000000"};
            case "ts":
                return {"id": 117, "symbol": "Ts", "fontColor": "#000000"};
            case "og":
                return {"id": 118, "symbol": "Og", "fontColor": "#000000"};
        }
    }

    //endregion

    //region 分子绘制
    function getScale(width, height, fontHeight, mWidth, mHeight) {
        let scaleW = (width - fontHeight) / mWidth, scaleH = (height - fontHeight) / mHeight, scale = 1;
        if (scaleW > scaleH)
            scale = scaleH;
        else
            scale = scaleW;
        return scale;
    }

    function moleculeInit(width, height) {
        //获取坐标系范围
        let atomMax = {'x': -1000000, 'y': -1000000}, atomMin = {'x': 1000000, 'y': 1000000};
        for (let i = 0; i < stream.atomCount; i++) {
            let atom = stream.atoms[i];
            if (atom.x > atomMax.x)
                atomMax.x = atom.x;
            if (atom.y > atomMax.y)
                atomMax.y = atom.y;
            if (atom.x < atomMin.x)
                atomMin.x = atom.x;
            if (atom.y < atomMin.y)
                atomMin.y = atom.y;
        }
        //求原始键长，此次采用简化的方式进行计算，会产生一定的错误
        let bondLengthMax = -1000000, bondLengthMin = 1000000, bondLength = 0;
        for (let i = 0; i < stream.bondCount; i++) {
            let bond = stream.bonds[i];
            let atomA = stream.atoms[bond.begin - 1];
            let atomB = stream.atoms[bond.end - 1];
            if (atomA.id != bond.begin || atomB.id != bond.end) {
                debugger;
            }
            let length = Math.sqrt(Math.pow((atomB.x - atomA.x), 2) + Math.pow((atomB.y - atomA.y), 2));
            bondLength += length;
            if (bondLengthMin > length)
                bondLengthMin = length;
            if (bondLengthMax < length)
                bondLengthMax = length;
        }
        // 防止C60等超大键长和超小键长
        if (stream.bondCount > 7) {
            let length = bondLength;
            bondLength = (length - bondLengthMin - bondLengthMax) / (stream.bondCount - 2);
            if (bondLengthMin * 3 < bondLengthMax)
                bondLength *= 0.6;
        } else {
            bondLength = bondLength / stream.bondCount;
        }
        let molecule = {'atomCount': stream.atomCount, 'bondCount': stream.bondCount, 'atoms': [], 'bonds': [], 'x': 0, 'y': 0, 'bondLength': bondLength, fontHeight: FONT_HEIGHT, 'stroke': 1, 'scale': 1};
        //不保留或存在原始坐标系
        molecule.scale = getScale(width, height, 0, atomMax.x - atomMin.x, atomMax.y - atomMin.y);
        molecule.stroke = BOND_LENGTH / bondLength;
        molecule.stroke = molecule.scale / molecule.stroke;
        molecule.fontHeight = FONT_HEIGHT * molecule.stroke;
        molecule.scale = getScale(width, height, molecule.fontHeight * 2, atomMax.x - atomMin.x, atomMax.y - atomMin.y);
        molecule.x = (width - molecule.fontHeight / 3) / 2 - (atomMax.x + atomMin.x) / 2 * molecule.scale;
        molecule.y = (height - molecule.fontHeight / 3) / 2 - (atomMax.y + atomMin.y) / 2 * molecule.scale;
        for (let i = 0; i < stream.atomCount; i++) {
            let a = stream.atoms[i];
            let atom = {'id': a.id, 'x': a.x * molecule.scale + molecule.x, 'y': a.y * molecule.scale + molecule.y, 'element': a.element, "stereoDouble": 0};
            molecule.atoms.push(atom);
        }
        for (let i = 0; i < stream.bondCount; i++) {
            let b = stream.bonds[i];
            let bond = {'id': b.id, 'begin': b.begin, 'end': b.end, 'bondType': b.bondType, "bondStereo": parseInt(b.bondStereo)};
            if (b.bondStereo == 1) {
                molecule.atoms[b.end - 1].stereoDouble++;
            }
            molecule.bonds.push(bond);
        }
        return molecule;
    }

    function molecularPre(molecule) {
        if (isEmpty(molecule))
            return null;
        return molecule;
    }

    function drawBond(molecule, panel) {
        let bondColor = "#222";
        for (let i = 0; i < molecule.bondCount; i++) {
            let bond = molecule.bonds[i];
            let atomA = molecule.atoms[bond.begin - 1];
            let atomB = molecule.atoms[bond.end - 1];
            let x1 = atomA.x, y1 = atomA.y, x2 = atomB.x, y2 = atomB.y, l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            let cos = (x2 - x1) / l, sin = (y2 - y1) / l, s = 3 / 5;
            if (atomA.element.toLowerCase() != "c") {
                x1 += cos * molecule.fontHeight * s;
                y1 += sin * molecule.fontHeight * s;
            }
            if (atomB.element.toLowerCase() != "c") {
                x2 -= cos * molecule.fontHeight * s;
                y2 -= sin * molecule.fontHeight * s;
            }
            switch (bond.bondType) {
                case 1:
                    switch (bond.bondStereo) {
                        case  1:
                            drawTriangle(panel, x1, y1, x2, y2, sin, cos, true, molecule.stroke, bondColor, atomB.stereoDouble > 1 ? true : false);
                            break;
                        case  4:
                            drawTriangle(panel, x1, y1, x2, y2, sin, cos, false, molecule.stroke, bondColor);
                            break;
                        case  6:
                            drawTriangleLine(panel, x1, y1, x2, y2, sin, cos, l, molecule.stroke, bondColor);
                            break;
                        default:
                            drawLine(panel, x1, y1, x2, y2, sin, cos, 0, molecule.stroke, bondColor);
                            break;
                    }
                    break;
                case 2:
                    let shift = 0.5;
                    drawLine(panel, x1, y1, x2, y2, sin, cos, shift, molecule.stroke, bondColor);
                    drawLine(panel, x1, y1, x2, y2, sin, cos, -shift, molecule.stroke, bondColor);
                    break;
                case 3:
                    drawLine(panel, x1, y1, x2, y2, sin, cos, 1, molecule.stroke, bondColor);
                    drawLine(panel, x1, y1, x2, y2, sin, cos, 0, molecule.stroke, bondColor);
                    drawLine(panel, x1, y1, x2, y2, sin, cos, -1, molecule.stroke, bondColor);
                    break;
            }
        }
    }

    function drawLine(panel, x1, y1, x2, y2, sin, cos, shift, stroke, color) {
        // let degrees = Math.atan2(y2 - y1, x2 - x1);
        // degrees = degrees * 180 / Math.PI;
        if (y2 > y1) {
            cos = -cos;
        }
        if (x1 > x2) {
            sin = -sin;
        }
        if (x1 < x2 && y1 > y2) {
            cos = -cos;
        }
        if (x1 > x2 && y1 < y2) {
            sin = -sin;
        }
        x1 += BOND_BLANK * sin * shift * stroke;
        y1 += BOND_BLANK * cos * shift * stroke;
        x2 += BOND_BLANK * sin * shift * stroke;
        y2 += BOND_BLANK * cos * shift * stroke;
        panel.drawLine(x1, y1, x2, y2, stroke, color);
    }

    function drawTriangle(panel, x1, y1, x2, y2, sin, cos, fillStyle, stroke, color, double) {
        let x3 = x2 - BOND_BLANK * sin * stroke;
        let y3 = y2 + BOND_BLANK * cos * stroke;
        let x4 = x2 + BOND_BLANK * sin * stroke;
        let y4 = y2 - BOND_BLANK * cos * stroke;
        panel.drawTriangle(x1, y1, x3, y3, x4, y4, fillStyle, stroke, color);
    }

    function drawTriangleLine(panel, x1, y1, x2, y2, sin, cos, length, stroke, color) {
        let count = (length - BOND_LINE_START * stroke) / BOND_LINE_SPACE + 1;
        let degree = Math.atan(BOND_BLANK * stroke / length);
        let x3 = x1 + BOND_LINE_START * cos * stroke;
        let y3 = y1 + BOND_LINE_START * sin * stroke;
        panel.drawLine(x1, y1, x3, y3, stroke, color);
        for (let i = 0; i < count; i++) {
            let a = (BOND_LINE_START * stroke + i * BOND_LINE_SPACE);
            let m = a * BOND_BLANK * stroke * sin / length, n = a * BOND_BLANK * stroke * cos / length;
            let x4 = x1 + a * cos + m;
            let y4 = y1 + a * sin - n;
            let x5 = x1 + a * cos - m;
            let y5 = y1 + a * sin + n;
            panel.drawLine(x4, y4, x5, y5, 1, color);
        }
    }

    function drawAtom(molecule, panel) {
        for (let i = 0; i < molecule.atomCount; i++) {
            let atom = molecule.atoms[i];
            if (atom.element.toLowerCase() == "c")
                continue;
            let color = "#000000", ele = atom.element.trim(), element = getElement(ele);
            if (element) {
                color = element.fontColor;
            }
            panel.drawText(atom.x - panel.measureText(ele, molecule.fontHeight) / 2, atom.y + molecule.fontHeight / 3, ele, molecule.fontHeight, color);
        }
    }

    function moleculeDraw(molecule, panel) {
        if (isEmpty(molecule))
            return;
        drawBond(molecule, panel);
        drawAtom(molecule, panel);
    }

    //endregion


    data = data.split('\n');
    readHead(data[stream.index]);
    if (stream.version == VERSION_V2000)
        readCTabV2000(data);
    else if (stream.version == VERSION_V3000)
        return {};
    else
        return {};
    if (stream != null && stream.state) {
        let molecule = moleculeInit(width, height);
        molecule = molecularPre(molecule);
        moleculeDraw(molecule, canvas);
    }
}

//===================================================================
// js 专用部分
//===================================================================
$0chem.mol2view = function (id, data) {
    let content = document.getElementById(id);
    let ctx = content.getContext("2d");
    let panel = {};
    panel.drawLine = function (x1, y1, x2, y2, lineWidth, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    panel.drawText = function (x, y, text, fontSize, color) {
        ctx.font = fontSize + "px Verdana";
        ctx.fillStyle = color;
        ctx.fillText(text.trim(), x, y);
    }
    panel.drawTriangle = function (x1, y1, x2, y2, x3, y3, fillStyle, lineWidth, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        if (fillStyle)
            ctx.lineWidth = 0.01;
        else
            ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    panel.measureText = function (text, fontSize) {
        ctx.font = fontSize + "px Verdana";
        return ctx.measureText(text).width;
    }
    $0chem.chemView(panel, data, content.offsetWidth, content.offsetHeight);
}
