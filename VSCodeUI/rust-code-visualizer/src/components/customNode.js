import Header from "./header";
import {useState} from 'react';

function CustomNode() {

    const [containerCollapse, setContainerCollapse] = useState(false);

    const handleCollapse = _ => {
        setContainerCollapse(containerCollapse => !containerCollapse);
    };

    let classNames = require('classnames');

    let containerCollapseClass = classNames({
      'collapse': containerCollapse,
      'visible': !containerCollapse,
      'mx-auto': !containerCollapse,
      'px-2': !containerCollapse,
      'sm:px-6': !containerCollapse,
      'lg:px-8': !containerCollapse,
      'pb-4': !containerCollapse
    });

    

    return (

        <div className="container mx-auto rounded-lg bg-gray-700 border-slate-600 font-mono">
            {/* Function Name */}
            <Header header={"Function Name"}> </Header>

            {/* Function info */}
            <div className="">

            </div>
        </div>

    );
}

export default CustomNode;