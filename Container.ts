/// <reference path="../../build/linq.d.ts" />

namespace BioDeep.UI {

    export class Container {

        /**
         * @param items 所需要进行拖拽的数据列表 是一个键值对，其中键名是资源的唯一标记，而键值则是用户界面显示使用的
         * @param containers 所接纳的容器对象的id编号列表
        */
        public constructor(items: Map<string, string>[], containers: string[]) {
            var data = Container.createDocument(items);
            var msie = /*@cc_on!@*/0;
            var links = data.Select(a => a.value).ToArray();
            var el = null;

            for (var i = 0; i < links.length; i++) {
                el = links[i];
                el.setAttribute('draggable', 'true');

                Linq.DOM.addEvent(el, 'dragstart', function (e) {
                    var event = <DragEvent>e;
                    // only dropEffect='copy' will be dropable
                    event.dataTransfer.effectAllowed = 'copy';
                    // required otherwise doesn't work
                    event.dataTransfer.setData('Text', this.id);
                });
            }

            var bin = document.querySelector('#bin');

            Linq.DOM.addEvent(bin, 'dragover', function (e) {
                if (e.preventDefault) {
                    // allows us to drop
                    e.preventDefault();
                }
                this.className = 'over';
                (<DragEvent>e).dataTransfer.dropEffect = 'copy';

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

                var event = <DragEvent>e;
                var el = document.getElementById(event.dataTransfer.getData('Text'));

                el.parentNode.removeChild(el);

                // stupid nom text + fade effect
                bin.className = '';
                yum.innerHTML = eat[parseInt(Math.random() * eat.length)];

                var y = yum.cloneNode(true);
                bin.appendChild(y);

                setTimeout(function () {
                    var t = setInterval(function () {
                        if (y.style.opacity <= 0) {
                            if (msie) { // don't bother with the animation
                                y.style.display = 'none';
                            }
                            clearInterval(t);
                        } else {
                            y.style.opacity -= 0.1;
                        }
                    }, 50);
                }, 250);

                return false;
            });
        }

        private static createDocument(items: Map<string, string>[]): IEnumerator<Map<HTMLLIElement, HTMLAnchorElement>> {
            return From(items)
                .Select(name => {
                    var li = document.createElement("li");
                    var a = document.createElement("a");

                    a.id = name.key;
                    a.href = "#";
                    a.innerText = name.value;
                    li.appendChild(a);

                    return <Map<HTMLLIElement, HTMLAnchorElement>>{
                        key: li, value: a
                    };
                });
        }
    }
}