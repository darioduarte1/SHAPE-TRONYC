/**********************************************************************************************************************************
******************************************* COOLDOWN DEL BUTTON DE REENVIAR EMAIL *************************************************
**********************************************************************************************************************************/

import { useState } from "react";

const useCooldown = () => {
  const [resendCooldown, setResendCooldown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const startCooldown = (duration) => {
    setResendCooldown(true);
    setSecondsLeft(duration);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return { resendCooldown, secondsLeft, startCooldown };
};

export default useCooldown;