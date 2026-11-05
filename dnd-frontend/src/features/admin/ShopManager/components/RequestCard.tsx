import { Button } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { describeTradeItems, isCountered, type SellRequest } from "@appTypes/Shop/Shop";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { convertCostToSilver, formatCostToDisplay, formatSilverToDisplay } from "@utils/currencyConverter";
import classes from "@features/admin/ShopManager/ShopManager.module.css";

interface RequestCardProps {
  request: SellRequest;
  equipment?: Equipment;
  characterName: string;
  chaScore: number;
  priceMultiplier: number;
  onCounter: () => void;
  onReject: () => void;
  onApprove: () => void;
}

const KIND_LABEL = { steal: "Steal attempt", trade: "Trade offer", haggle: "Haggle", sell: "Sell offer" } as const;

const gp = (amountGp: number) => formatSilverToDisplay(Math.round(Math.abs(amountGp) * 100));

export function RequestCard({ request: req, equipment, characterName, chaScore, priceMultiplier, onCounter, onReject, onApprove }: RequestCardProps) {
  const kind = req.isSteal ? "steal" : req.isTrade ? "trade" : req.isHaggle ? "haggle" : "sell";
  const chaMod = Math.floor((chaScore - 10) / 2);
  const itemName = kind === "trade" ? "Item swap" : equipment?.name ?? "Unknown item";
  const askingSp = Math.round(convertCostToSilver(equipment?.cost) * priceMultiplier) * req.quantity;
  const haggleDiscount = askingSp > 0 ? Math.round((1 - (req.offeredPriceGp * 100) / askingSp) * 100) : 0;

  const priceLabel = kind === "trade" ? (req.offeredPriceGp < 0 ? "Shop pays" : "Player pays") : kind === "sell" ? "Asking" : "Offer";

  return (
    <div className={classes.request} data-kind={kind}>
      <div className={classes.requestTop}>
        <div>
          <div className={classes.requestKind}>{KIND_LABEL[kind]}</div>
          <div className={classes.requestTitle}>{itemName}</div>
          {kind === "trade" ? (
            <div className={classes.requestDetail}>
              Gives <b>{describeTradeItems(req.giveItems) || "nothing"}</b>
              <br />
              Wants <b>{describeTradeItems(req.wantItems) || "nothing"}</b>
            </div>
          ) : (
            <div className={classes.requestDetail}>
              Qty <b>{req.quantity}</b> · {kind === "haggle" ? "List" : "Base"}{" "}
              <b>{kind === "haggle" ? formatSilverToDisplay(askingSp) : formatCostToDisplay(equipment?.cost)}</b>
            </div>
          )}
        </div>
        <div className={classes.requestPrice}>
          <div className={classes.requestPriceLabel}>{priceLabel}</div>
          <div className={classes.requestPriceValue}>{kind === "steal" ? "—" : gp(req.offeredPriceGp)}</div>
          {kind === "haggle" && haggleDiscount !== 0 && (
            <div className={classes.requestDetail}>
              {Math.abs(haggleDiscount)}% {haggleDiscount > 0 ? "below" : "above"} list
            </div>
          )}
        </div>
      </div>

      <div className={classes.requestFooter}>
        <span className={classes.requestWho} title={req.createdAt ? new Date(req.createdAt).toLocaleString() : undefined}>
          <b>{characterName}</b> · CHA {chaScore} ({chaMod >= 0 ? "+" : ""}{chaMod})
        </span>
        {isCountered(req) ? (
          <span className={classes.requestWaiting}>
            Countered {(req.counterPriceGp ?? 0) < 0 ? "(shop pays) " : ""}{gp(req.counterPriceGp ?? 0)} · awaiting reply
          </span>
        ) : (
          <div className={classes.requestActions}>
            {kind !== "steal" && (
              <Button size="compact-xs" className="glass-btn-secondary" onClick={onCounter}>
                Counter
              </Button>
            )}
            <Button size="compact-xs" className="glass-btn-secondary" leftSection={<IconX size={12} />} onClick={onReject}>
              Reject
            </Button>
            <Button size="compact-xs" className="glass-btn-primary" leftSection={<IconCheck size={12} />} onClick={onApprove}>
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
