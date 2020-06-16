import React, { Fragment } from "react";
import MonitorSet from "../monitorSet";
import SwapButton from "../swapButton";
import styles from "./styles.scss";

const TriangleLayout = ({
  receiverOne,
  receiverTwo,
  receiverThree,
  openChannelsModal,
  swapChannels,
}) => (
  <Fragment>
    <div className={styles.topRow}>
      <MonitorSet
        receiver={receiverThree}
        openChannelsModal={openChannelsModal}
      />
    </div>
    <div className={styles.middleRow}>
      <SwapButton
        className={styles.swapTopLeft}
        swapChannels={() => {
          swapChannels(receiverOne, receiverThree);
        }}
      />
      <div />
      <SwapButton
        className={styles.swapTopRight}
        swapChannels={() => {
          swapChannels(receiverTwo, receiverThree);
        }}
      />
    </div>
    <div className={styles.bottomRow}>
      <div className={styles.left}>
        <MonitorSet
          receiver={receiverOne}
          openChannelsModal={openChannelsModal}
        />
      </div>
      <SwapButton
        className={styles.swapLeftRight}
        swapChannels={() => {
          swapChannels(receiverOne, receiverTwo);
        }}
      />
      <div className={styles.right}>
        <MonitorSet
          receiver={receiverTwo}
          openChannelsModal={openChannelsModal}
        />
      </div>
    </div>
  </Fragment>
);

export default TriangleLayout;
