import React, { Fragment } from "react";
import MonitorSet from "../monitorSet";
import SwapButton from "../swapButton";
import styles from "./styles.scss";

const TwoByFourLayout = ({
  receiverOne,
  receiverTwo,
  receiverThree,
  receiverFour,
  openChannelsModal,
  swapChannels,
}) => (
  <Fragment>
    <div className={styles.topRow}>
      <MonitorSet
        receiver={receiverThree}
        openChannelsModal={openChannelsModal}
      />
      <SwapButton
        className={styles.swapLeftRight}
        swapChannels={() => {
          swapChannels(receiverThree, receiverFour);
        }}
      />
      <MonitorSet
        receiver={receiverFour}
        openChannelsModal={openChannelsModal}
      />
    </div>
    <div className={styles.middleRow}>
      <SwapButton
        className={styles.swapTopBottom}
        swapChannels={() => {
          swapChannels(receiverOne, receiverThree);
        }}
      />
      <SwapButton
        className={styles.swapTopRightBottomLeft}
        swapChannels={() => {
          swapChannels(receiverOne, receiverFour);
        }}
      />
      <SwapButton
        className={styles.swapTopLeftBottomRight}
        swapChannels={() => {
          swapChannels(receiverTwo, receiverThree);
        }}
      />
      <SwapButton
        className={styles.swapTopBottom}
        swapChannels={() => {
          swapChannels(receiverTwo, receiverFour);
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

export default TwoByFourLayout;
