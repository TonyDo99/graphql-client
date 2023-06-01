"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import graphqlActions from "@/graphql";
import WalletBox from "@/components/WalletBox";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { GET_FULL_COIN_DETAIL } from "@/graphql/coins/constants";
import CoinBox from "@/components/CoinBox";
import FormItem from "@/components/FormItem";
import Input from "@/components/Input";
import useRefForm from "@/hooks/useRefForm";
import Form from "@/components/Form";
import Button from "@/components/Button";
import { isEmpty } from "@/ultis/helpers";

type Props = {};

const getWalletsQuery = graphqlActions.query.getWallets;
const buyCoinMutation = graphqlActions.mutation.buyCoin;
const getCoinQuery = graphqlActions.query.getCoin(GET_FULL_COIN_DETAIL);

const Payment = (props: Props) => {
  const [quantity, setQuantity] = useState<any>("0");
  const searchParams = useSearchParams();
  const [form] = useRefForm();
  const coinId = searchParams.get("coinId");
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const router = useRouter();

  const { data, loading } = useQuery(getWalletsQuery, {
    onCompleted: (data) => {},
    variables: {
      userId: userId,
    },
  });

  const [radio, setRadio] = useState(data?.userId?.wallets[0]?.WL_Id);

  const { data: coinData, loading: coinLoading } = useQuery(getCoinQuery, {
    onCompleted: (data) => {},
    variables: {
      coinId,
    },
  });

  const [buyCoin] = useMutation(buyCoinMutation, {
    onCompleted: (data) => router.push(`/profile/${userId}`),
  });

  const handleOnRadioSelect = (value: any) => setRadio(value);
  const handleOnSubmit = (value: any) => {
    if (isEmpty(value.quantity)) return;
    const _quantity = parseInt(quantity);

    const input = {
      coinId,
      quantity: _quantity,
      walletId: parseInt(radio),
    };

    return buyCoin({
      variables: {
        buyCoinInput: input,
      },
    });
  };

  const handleUpdatePrice = (data: any) => setQuantity(data);

  return (
    <div>
      <h3 className="p-5 mb-10 text-5xl text-center">
        Please choose wallet to make payment
      </h3>
      <div className="flex w-full gap-5">
        <div className="w-2/5">
          {!coinLoading ? (
            <CoinBox coinDetail={coinData.coin} className="w-full rounded" />
          ) : (
            <LoadingSkeleton />
          )}
        </div>
        <div className="w-3/5 flex flex-col gap-5">
          <div className="border border-blue-400 p-5 rounded">
            {!loading ? (
              <WalletBox
                onRadioSelect={handleOnRadioSelect}
                walletOptions={data?.userId?.wallets}
                selectable={true}
                defaultWallet={data?.userId?.wallets[0]?.WL_Id}
              />
            ) : (
              <LoadingSkeleton />
            )}
          </div>
          <div className="border border-blue-400 p-5 rounded h-full">
            <Form form={form} onSubmit={handleOnSubmit}>
              <FormItem
                label="Quantity"
                name="quantity"
                rules={[
                  {
                    required: {
                      value: true,
                      message: "Please choose quantity",
                    },
                  },
                ]}
              >
                <Input
                  defaultValue={0}
                  type="number"
                  onBlur={handleUpdatePrice}
                />
              </FormItem>

              <div className="py-5">
                <span>Total Price: </span>
                <span>
                  {(coinData?.coin.CN_Price * quantity).toLocaleString()} USD
                </span>
              </div>
              <Button type="submit" className="pointer">
                Buy
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
