/// <reference path="../../../build/linq.d.ts" />
declare namespace BioDeep.UI {
    class Container {
        private containers;
        readonly Data: object;
        /**
         * @param items 所需要进行拖拽的数据列表 是一个键值对，其中键名是资源的唯一标记，而键值则是用户界面显示使用的
         * @param containers 所接纳的容器对象的id编号列表
        */
        constructor(items: Map<string, string>[], srcContainer: string, containers: string[]);
        private registerContainers;
        private binEach;
        /**
         * 为数据对象在容器之中注册鼠标事件
        */
        private registerDatas;
        private static createDocument;
    }
}
declare namespace BioDeep.UI {
    function stylingContainers(names: string[]): void;
    function stylingItems(keys: IEnumerator<string>): void;
}
