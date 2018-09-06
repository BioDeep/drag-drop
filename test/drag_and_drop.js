/// <reference path="../../build/linq.d.ts" />
var BioDeep;
(function (BioDeep) {
    var UI;
    (function (UI) {
        var Container = /** @class */ (function () {
            /**
             * @param items 所需要进行拖拽的数据列表 是一个键值对，其中键名是资源的唯一标记，而键值则是用户界面显示使用的
             * @param containers 所接纳的容器对象的id编号列表
            */
            function Container(items, srcContainer, containers) {
                this.containers = new Dictionary(TypeInfo.EmptyObject(containers, function () { return []; }));
                this.registerDatas(items, srcContainer);
                this.registerContainers(containers);
                UI.stylingContainers(containers);
                UI.stylingItems(From(items).Select(function (id) { return id.key; }));
            }
            Object.defineProperty(Container.prototype, "Data", {
                get: function () {
                    var x = {};
                    var table = this.containers;
                    this.containers
                        .Keys
                        .ForEach(function (key) {
                        x[key] = table.Item(key);
                    });
                    return x;
                },
                enumerable: true,
                configurable: true
            });
            Container.prototype.registerContainers = function (names) {
                var _this = this;
                From(names)
                    .Select(function (id) { return document.querySelector("#" + id); })
                    .ForEach(function (container) {
                    var ul = document.createElement("ul");
                    ul.id = container.id + "-ul";
                    container.appendChild(ul);
                    _this.binEach(container, _this.containers);
                });
            };
            Container.prototype.binEach = function (bin, container) {
                var key = bin.id;
                Linq.DOM.addEvent(bin, 'dragover', function (e) {
                    if (e.preventDefault) {
                        // allows us to drop
                        e.preventDefault();
                    }
                    this.className = 'over';
                    e.dataTransfer.dropEffect = 'copy';
                    return false;
                });
                // to get IE to work
                Linq.DOM.addEvent(bin, 'dragenter', function (e) {
                    this.className = 'over';
                    return false;
                });
                Linq.DOM.addEvent(bin, 'dragleave', function () {
                    this.className = '';
                });
                Linq.DOM.addEvent(bin, 'drop', function (e) {
                    if (e.stopPropagation) {
                        // stops the browser from redirecting...why???
                        e.stopPropagation();
                    }
                    var event = e;
                    var strval = event.dataTransfer.getData('Text');
                    console.log(strval);
                    var data = JSON.parse(strval);
                    var keyId = data.key;
                    var el = document.getElementById(keyId);
                    el.parentNode.removeChild(el);
                    // stupid nom text + fade effect
                    bin.className = '';
                    document.getElementById(bin.id + "-ul").appendChild(Container.createItem(data).key);
                    UI.applyItemStyle(keyId);
                    // 在这里得到data数据之后，将数据添加进入对应的容器之中
                    // console.log(container);
                    container.Item(key).push(data.key);
                    return false;
                });
            };
            /**
             * 为数据对象在容器之中注册鼠标事件
            */
            Container.prototype.registerDatas = function (items, srcContainer) {
                var data = Container.createDocument(items);
                var container = document.getElementById(srcContainer);
                data.ForEach(function (a) {
                    container.appendChild(a.key);
                });
                data.Select(function (a) { return a.value; })
                    .ForEach(function (el) {
                    el.setAttribute('draggable', 'true');
                    Linq.DOM.addEvent(el, 'dragstart', function (e) {
                        var event = e;
                        var data = JSON.stringify({
                            key: el.id,
                            value: el.innerText
                        });
                        // only dropEffect='copy' will be dropable
                        event.dataTransfer.effectAllowed = 'copy';
                        // required otherwise doesn't work
                        event.dataTransfer.setData('Text', data);
                    });
                });
            };
            Container.createItem = function (item) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.id = item.key;
                a.href = "#";
                a.innerText = item.value;
                li.appendChild(a);
                return {
                    key: li, value: a
                };
            };
            Container.createDocument = function (items) {
                return From(items).Select(Container.createItem);
            };
            return Container;
        }());
        UI.Container = Container;
    })(UI = BioDeep.UI || (BioDeep.UI = {}));
})(BioDeep || (BioDeep = {}));
var BioDeep;
(function (BioDeep) {
    var UI;
    (function (UI) {
        function stylingContainers(names) {
            names.forEach(function (id) {
                var div = document.getElementById(id);
                var style = div.style;
                style.height = "250px";
                style.width = "166px";
                style.cssFloat = "left";
                style.border = "5px solid #000";
                style.position = "relative";
                style.marginTop = "0";
            });
        }
        UI.stylingContainers = stylingContainers;
        function stylingItems(keys) {
            if (typeof keys == "string") {
                applyItemStyle(keys);
            }
            else if (Array.isArray(keys)) {
                keys.forEach(applyItemStyle);
            }
            else {
                keys.ForEach(applyItemStyle);
            }
        }
        UI.stylingItems = stylingItems;
        function applyItemStyle(id) {
            var a = document.getElementById(id);
            var style = a.style;
            style.textDecoration = "none";
            style.color = "#000";
            style.margin = "10px";
            style.width = "150px";
            style.border = "3px dashed #999";
            style.background = "#eee";
            style.padding = "10px";
            style.display = "block";
        }
        UI.applyItemStyle = applyItemStyle;
    })(UI = BioDeep.UI || (BioDeep.UI = {}));
})(BioDeep || (BioDeep = {}));
//# sourceMappingURL=drag_and_drop.js.map