import { db } from "../firebase/config";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { validateOrderData } from "../utils/validation";

export const processOrder = async (orderData) => {
  const validation = validateOrderData(orderData);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(", "));
  }

  try {
    const prepTime = calculateOrderPrepTime(orderData.items);

    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "processing",
      estimatedPrepTime: prepTime,
      createdAt: new Date().toISOString(),
    });

    await updateKitchenCapacity(orderData.items.length);

    return {
      id: orderRef.id,
      estimatedPrepTime: prepTime,
      ...orderData,
    };
  } catch (error) {
    if (!navigator.onLine) {
      return {
        id: `offline_${Date.now()}`,
        estimatedPrepTime: calculateOrderPrepTime(orderData.items),
        ...orderData,
        status: "pending_sync",
      };
    }
    console.error("Order processing failed:", error);
    throw error;
  }
};

const calculateOrderPrepTime = (items) => {
  const baseTime = items.reduce(
    (total, item) => total + item.preparationTime,
    0
  );
  const currentHour = new Date().getHours();

  const isRushHour =
    (currentHour >= 11 && currentHour <= 14) ||
    (currentHour >= 18 && currentHour <= 21);

  return isRushHour ? Math.ceil(baseTime * 1.5) : baseTime;
};

const updateKitchenCapacity = async (orderSize) => {};
