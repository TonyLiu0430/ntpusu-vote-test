<template>
  <div class="flex justify-center">
    <ElCard
      v-if="!votingPending && voting !== null"
      class="w-full md:w-5/6 xl:w-2/3 2xl:w-1/2"
    >
      <div class="flex justify-around">
        <div class="flex items-center text-center">
          <h1 class="text-2xl font-bold sm:text-3xl md:text-4xl">
            {{ voting.name }}
          </h1>
        </div>
        <ElStatistic
          class="flex min-w-[calc(55px+5dvw)] flex-col items-center justify-center text-center"
          title="投票人數"
          :value="voteCnt()"
        >
          <template #suffix>人</template>
        </ElStatistic>
      </div>
      <ElDivider />
      <div class="flex justify-around">
        <div class="text-center">
          <h1 class="text-lg">開始時間</h1>
          <ElText tag="b">{{ viewDate(voting.startTime) }}</ElText>
        </div>
        <div class="text-center">
          <h1 class="text-lg">結束時間</h1>
          <ElText tag="b">{{ viewDate(voting.endTime) }}</ElText>
        </div>
      </div>
      <ElDivider />
      <div class="text-center">
        <h1
          v-if="voting.onlyOne"
          class="pb-6 text-xl font-bold sm:text-2xl md:text-3xl"
        >
          {{ findCandidate()?.name }}
        </h1>
        <h1
          v-else
          class="pb-6 text-xl font-bold sm:text-2xl md:text-3xl"
        >
          選 舉 結 果
        </h1>
        <ElSpace
          class="justify-center"
          wrap
        >
          <template v-if="voting.onlyOne">
            <ElCard
              v-for="(candidate, index) in findOther()"
              :key="index"
              shadow="hover"
              class="max-w-[12rem] md:max-w-[15rem] xl:max-w-[18rem]"
            >
              <div class="px-6 text-center">
                <h1 class="text-lg sm:text-xl md:text-2xl">
                  {{ candidate.name }}
                </h1>
              </div>
              <ElDivider class="!my-5" />
              <ElStatistic
                class="m-1 text-center"
                title="票數"
                :value="candidate._count.ballots"
                suffix="票"
              />
              <ElDivider class="!xy-5" />
              <ElProgress
                type="dashboard"
                :percentage="
                  voteCnt() === 0
                    ? 0
                    : (candidate._count.ballots * 100) / voteCnt()
                "
                color="#409EFF"
              >
                <template #default="{ percentage }">
                  <ElStatistic
                    class="text-center"
                    :precision="2"
                    :value="percentage"
                    suffix="%"
                  >
                    <template #title>
                      <span class="text-base">得票率</span>
                    </template>
                  </ElStatistic>
                </template>
              </ElProgress>
            </ElCard>
          </template>
          <template v-else>
            <ElCard
              v-for="(candidate, index) in voting.candidates"
              :key="index"
              shadow="hover"
              class="max-w-[12rem] md:max-w-[15rem] xl:max-w-[18rem]"
            >
              <div class="px-6 text-center">
                <h1 class="text-lg sm:text-xl md:text-2xl">
                  {{ candidate.name }}
                </h1>
              </div>
              <ElDivider class="!my-5" />
              <ElStatistic
                class="m-1 text-center"
                title="票數"
                :value="candidate._count.ballots"
                suffix="票"
              />
              <ElDivider class="!xy-5" />
              <ElProgress
                type="dashboard"
                :percentage="
                  voteCnt() === 0
                    ? 0
                    : (candidate._count.ballots * 100) / voteCnt()
                "
                color="#409EFF"
              >
                <template #default="{ percentage }">
                  <ElStatistic
                    class="text-center"
                    :precision="2"
                    :value="percentage"
                    suffix="%"
                  >
                    <template #title>
                      <span class="text-base">得票率</span>
                    </template>
                  </ElStatistic>
                </template>
              </ElProgress>
            </ElCard>
          </template>
        </ElSpace>
      </div>
    </ElCard>
    <ElSkeleton
      v-else
      class="flex justify-center"
      animated
    >
      <template #template>
        <ElSkeletonItem
          variant="rect"
          class="!h-[100dvh] !w-full md:!w-5/6 xl:!w-2/3 2xl:!w-1/2"
        />
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: "結果",
});

const { id } = useRoute().params as { id: string };

const { data: voting, pending: votingPending } = await useLazyFetch(
  "/api/voting/getResult",
  {
    key: id,
    query: { id },
  },
);

const findCandidate = () => {
  return voting.value?.candidates.find(
    (candidate) =>
      candidate.name != "廢票" &&
      candidate.name != "同意" &&
      candidate.name != "不同意",
  );
};

const findOther = () => {
  return voting.value?.candidates.filter(
    (candidate) =>
      candidate.name == "廢票" ||
      candidate.name == "同意" ||
      candidate.name == "不同意",
  );
};

const viewDate = (time: string | number | Date) => {
  return new Date(time).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const voteCnt = () => {
  if (!voting.value) return 0;

  return voting.value.candidates.reduce((acc, cur) => {
    return acc + cur._count.ballots;
  }, 0);
};

const checkData = () => {
  setTimeout(async () => {
    if (votingPending.value) checkData();
    else if (!voting.value && useRoute().path == "/result/" + id)
      await useRouter().push("/404");
  }, 250);
};

onActivated(() => {
  checkData();
});
</script>
